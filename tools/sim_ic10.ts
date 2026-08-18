#!/usr/bin/env bun

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  Builer,
  Chip,
  ErrorSeverity,
  Ic10Runner,
  InstructionLine,
  Languages,
  Network,
  StructureCircuitHousing,
  i18n,
  type Ic10Error,
} from "@stationeers-ic/ic10";

import "./ic10_compat";

const FAILURE_SEVERITIES = new Set([ErrorSeverity.Strong, ErrorSeverity.Critical]);
const languageInitialization = i18n.init({
  lng: "en",
  fallbackLng: "en",
  debug: false,
  resources: Languages,
});

type ExpectedNumber = number | { value: number; tolerance?: number };

type ScenarioEnvironment = Record<string, unknown> & {
  chips: Array<Record<string, unknown> & { id: number; code?: string }>;
  devices: Array<Record<string, unknown> & { id: number; chip?: number }>;
};

type SimpleDevice = {
  id: number;
  prefab: string;
  pin?: `d${number}`;
  virtual?: boolean;
  name?: string;
  props?: Record<string, number>;
  slots?: Array<{
    index: number;
    item: string;
    amount?: number;
  }>;
};

type ScenarioChange = {
  afterStep: number;
  registers?: Record<string, number>;
  devices?: Record<string, Record<string, number>>;
  slots?: Record<string, Record<string, Record<string, number>>>;
};

type Scenario = {
  version: 1;
  script: string;
  housingId?: number;
  steps: number;
  devices?: SimpleDevice[];
  environment?: ScenarioEnvironment;
  changes?: ScenarioChange[];
  expect?: {
    registers?: Record<string, ExpectedNumber>;
    devices?: Record<string, Record<string, ExpectedNumber>>;
    nextLine?: number;
  };
};

export type CheckResult = {
  file: string;
  errors: Ic10Error[];
};

export type ScenarioResult = {
  scenario: string;
  script: string;
  stepsExecuted: number;
  failures: string[];
  errors: Ic10Error[];
};

export type ValidationResult = {
  checks: CheckResult[];
  scripts: string[];
  scenarios: ScenarioResult[];
  scenarioErrors: Array<{ scenario: string; message: string }>;
};

function isFailure(error: Ic10Error): boolean {
  return FAILURE_SEVERITIES.has(error.severity);
}

function formatError(file: string, error: Ic10Error): string {
  const line = error.line === undefined ? "" : `:${error.line + 1}`;
  return `${file}${line}: [${error.severity}] ${error.code}: ${error.message}`;
}

function createRunner(code: string): Ic10Runner {
  const network = new Network({ id: "static-check", networkType: "data" });
  const chip = new Chip({ id: 0, ic10Code: code });
  const housing = new StructureCircuitHousing({ id: 0, network, chip });
  return new Ic10Runner({ housing });
}

/**
 * Parse every line and resolve every operand in physical order. Alias and define
 * instructions are executed so later lines see the same names as the game.
 * Other instructions are not executed, avoiding control-flow and device side
 * effects during a repository-wide syntax check.
 */
export async function checkSource(code: string, file = "<memory>"): Promise<CheckResult> {
  await languageInitialization;
  const runner = createRunner(code);
  runner.init();

  for (const line of runner.lines) {
    if (!(line instanceof InstructionLine) || !line.instruction) continue;

    runner.context.setExecuteLine(line);
    const instruction = line.instruction;
    const rules = instruction.argumentListCached;

    if (line.args.length !== rules.length) {
      await instruction.execute();
      continue;
    }

    if (line.instructionName === "alias" || line.instructionName === "define") {
      await instruction.execute();
      continue;
    }

    for (let index = 0; index < rules.length; index += 1) {
      instruction.getArgumentValue(index);
    }
  }

  return { file, errors: runner.context.errors };
}

async function findFiles(target: string, suffix: string): Promise<string[]> {
  const targetStat = await stat(target);
  if (targetStat.isFile()) return target.endsWith(suffix) ? [target] : [];

  const files: string[] = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...(await findFiles(child, suffix)));
    if (entry.isFile() && entry.name.endsWith(suffix)) files.push(child);
  }
  return files.sort();
}

async function resolveTarget(target: string): Promise<string> {
  const direct = path.resolve(target);
  try {
    await stat(direct);
    return direct;
  } catch {
    const belowScripts = path.resolve("scripts", target);
    await stat(belowScripts);
    return belowScripts;
  }
}

async function scenariosForTarget(target: string, scripts: string[]): Promise<string[]> {
  const targetStat = await stat(target);
  const scenarioRoot = targetStat.isFile() ? path.dirname(target) : target;
  const candidates = await findFiles(scenarioRoot, ".sim.json");
  if (!targetStat.isFile()) return candidates;

  const wantedScripts = new Set(scripts.map((script) => path.resolve(script)));
  const matches: string[] = [];
  for (const candidate of candidates) {
    try {
      const scenario = JSON.parse(await readFile(candidate, "utf8")) as Partial<Scenario>;
      if (typeof scenario.script !== "string") continue;
      const script = path.resolve(path.dirname(candidate), scenario.script);
      if (wantedScripts.has(script)) matches.push(candidate);
    } catch {
      // Whole-directory validation reports malformed scenarios. A focused file
      // run cannot safely decide which script an unreadable scenario targets.
    }
  }
  return matches;
}

export async function checkPath(target: string): Promise<CheckResult[]> {
  const files = await findFiles(target, ".ic10");
  return Promise.all(
    files.map(async (file) => checkSource(await readFile(file, "utf8"), file)),
  );
}

function checkExpectedNumber(label: string, actual: number | undefined, expected: ExpectedNumber): string | undefined {
  const value = typeof expected === "number" ? expected : expected.value;
  const tolerance = typeof expected === "number" ? 0 : (expected.tolerance ?? 0);

  if (actual === undefined) return `${label}: value is unavailable; expected ${value}`;
  if (Number.isNaN(value) && Number.isNaN(actual)) return undefined;
  if (Math.abs(actual - value) <= tolerance) return undefined;
  return `${label}: expected ${value}${tolerance ? ` ± ${tolerance}` : ""}, got ${actual}`;
}

function createSimpleEnvironment(devices: SimpleDevice[], housingId: number): ScenarioEnvironment {
  const chipId = 1;
  return {
    version: 1,
    chips: [{ id: chipId }],
    devices: [
      {
        id: housingId,
        PrefabName: "StructureCircuitHousing",
        chip: chipId,
        pins: devices
          .filter((device) => device.pin && !device.virtual)
          .map((device) => ({ pin: device.pin, device: device.id })),
        ports: [{ port: "default", network: "base" }],
      },
      ...devices.map((device) => ({
        id: device.id,
        PrefabName: device.prefab,
        name: device.name,
        props: Object.entries(device.props ?? {}).map(([name, value]) => ({ name, value })),
        slots: device.slots?.map((slot) => ({
          index: slot.index,
          item: slot.item,
          amount: slot.amount ?? 1,
        })),
        ports: device.virtual ? undefined : [{ port: "default", network: "base" }],
      })),
    ],
    networks: [{ id: "base", type: "data" }],
  };
}

function connectVirtualPins(builder: Builer, housingId: number, devices: SimpleDevice[]): void {
  const housing = builder.Devices.get(housingId) as
    | { connectedDevices?: Map<number, unknown> }
    | undefined;
  if (!housing?.connectedDevices) throw new Error(`housing ${housingId} cannot accept virtual pins`);

  for (const configured of devices.filter((device) => device.virtual)) {
    if (!configured.pin) throw new Error(`virtual device ${configured.id} requires a pin`);
    const device = builder.Devices.get(configured.id);
    if (!device) throw new Error(`virtual device not found: ${configured.id}`);
    housing.connectedDevices.set(Number(configured.pin.slice(1)), device);
  }
}

function scenarioEnvironment(scenario: Scenario): { environment: ScenarioEnvironment; housingId: number } {
  const housingId = scenario.housingId ?? 10;
  if (scenario.environment && scenario.devices) {
    throw new Error("scenario must use either devices or environment, not both");
  }
  if (scenario.environment) return { environment: scenario.environment, housingId };
  if (scenario.devices) {
    const ids = new Set<number>([housingId]);
    for (const device of scenario.devices) {
      if (ids.has(device.id)) throw new Error(`duplicate device or housing id: ${device.id}`);
      ids.add(device.id);
    }
    return { environment: createSimpleEnvironment(scenario.devices, housingId), housingId };
  }
  throw new Error("scenario must define devices or environment");
}

function injectScript(environment: ScenarioEnvironment, housingId: number, code: string): void {
  const housing = environment.devices.find((device) => device.id === housingId);
  if (!housing || typeof housing.chip !== "number") {
    throw new Error(`housing ${housingId} is missing or has no chip`);
  }

  const chip = environment.chips.find((candidate) => candidate.id === housing.chip);
  if (!chip) throw new Error(`chip ${housing.chip} for housing ${housingId} is missing`);
  chip.code = code;
}

function applyScenarioChange(
  change: ScenarioChange,
  runner: Ic10Runner,
  builder: Builer,
): void {
  for (const [register, value] of Object.entries(change.registers ?? {})) {
    const match = /^r(\d+)$/.exec(register);
    if (!match) throw new Error(`invalid changed register name: ${register}`);
    const registerNumber = Number(match[1]);
    if (!runner.realContext.chip.registers.has(registerNumber)) {
      throw new Error(`changed register is unavailable: ${register}`);
    }
    runner.realContext.chip.registers.set(registerNumber, value);
  }

  for (const [deviceId, properties] of Object.entries(change.devices ?? {})) {
    const device = builder.Devices.get(Number(deviceId));
    if (!device) throw new Error(`changed device not found: ${deviceId}`);
    for (const [property, value] of Object.entries(properties)) {
      device.props?.forceWrite(property, value);
    }
  }

  for (const [deviceId, slots] of Object.entries(change.slots ?? {})) {
    const device = builder.Devices.get(Number(deviceId));
    if (!device) throw new Error(`changed slot device not found: ${deviceId}`);
    for (const [slotIndex, properties] of Object.entries(slots)) {
      const item = device.slots?.getSlot(Number(slotIndex))?.getItem();
      if (!item) throw new Error(`changed slot is empty: ${deviceId}.${slotIndex}`);
      for (const [property, value] of Object.entries(properties)) {
        item.setProp(property, value);
      }
    }
  }
}

export async function runScenario(scenarioFile: string): Promise<ScenarioResult> {
  await languageInitialization;
  const scenarioPath = path.resolve(scenarioFile);
  const scenario = JSON.parse(await readFile(scenarioPath, "utf8")) as Scenario;
  if (scenario.version !== 1) throw new Error(`unsupported scenario version: ${scenario.version}`);
  if (!Number.isInteger(scenario.steps) || scenario.steps < 0) {
    throw new Error("scenario steps must be a non-negative integer");
  }
  for (const change of scenario.changes ?? []) {
    if (!Number.isInteger(change.afterStep) || change.afterStep < 0 || change.afterStep > scenario.steps) {
      throw new Error("change afterStep must be an integer between zero and scenario steps");
    }
  }

  const scriptPath = path.resolve(path.dirname(scenarioPath), scenario.script);
  const { environment, housingId } = scenarioEnvironment(scenario);
  injectScript(environment, housingId, await readFile(scriptPath, "utf8"));

  const builder = Builer.from(JSON.stringify(environment));
  if (scenario.devices) connectVirtualPins(builder, housingId, scenario.devices);
  const runner = builder.Runners.get(housingId);
  if (!runner) throw new Error(`emulator did not create runner for housing ${housingId}`);

  runner.switchContext("real");
  runner.init();
  // Tests should model state changes, not spend wall-clock time in IC10 sleep.
  runner.realContext.sleep = async () => {};

  const changesByStep = new Map<number, ScenarioChange[]>();
  for (const change of scenario.changes ?? []) {
    const changes = changesByStep.get(change.afterStep) ?? [];
    changes.push(change);
    changesByStep.set(change.afterStep, changes);
  }
  for (const change of changesByStep.get(0) ?? []) {
    applyScenarioChange(change, runner, builder);
  }

  let stepsExecuted = 0;
  while (stepsExecuted < scenario.steps) {
    const nextLine = runner.realContext.getNextLineIndex();
    if (nextLine < 0 || nextLine >= runner.lines.length) break;
    stepsExecuted += 1;
    if (!(await runner.step())) break;
    for (const change of changesByStep.get(stepsExecuted) ?? []) {
      applyScenarioChange(change, runner, builder);
    }
  }

  runner.realContext.collectErrors();
  const errors = runner.realContext.errors;
  const failures = errors.filter(isFailure).map((error) => formatError(scriptPath, error));

  for (const [register, expected] of Object.entries(scenario.expect?.registers ?? {})) {
    const match = /^r(\d+)$/.exec(register);
    if (!match) {
      failures.push(`invalid expected register name: ${register}`);
      continue;
    }
    const actual = runner.realContext.chip.registers.get(Number(match[1]));
    const failure = checkExpectedNumber(`register ${register}`, actual, expected);
    if (failure) failures.push(failure);
  }

  for (const [deviceId, properties] of Object.entries(scenario.expect?.devices ?? {})) {
    const device = builder.Devices.get(Number(deviceId));
    if (!device) {
      failures.push(`device ${deviceId}: not found`);
      continue;
    }
    for (const [property, expected] of Object.entries(properties)) {
      const actual = device.props?.forceRead(property);
      const failure = checkExpectedNumber(`device ${deviceId}.${property}`, actual, expected);
      if (failure) failures.push(failure);
    }
  }

  if (
    scenario.expect?.nextLine !== undefined &&
    runner.realContext.getNextLineIndex() !== scenario.expect.nextLine
  ) {
    failures.push(
      `next line: expected ${scenario.expect.nextLine}, got ${runner.realContext.getNextLineIndex()}`,
    );
  }

  return { scenario: scenarioPath, script: scriptPath, stepsExecuted, failures, errors };
}

/** Check every IC10 file and run every *.sim.json below a directory. */
export async function validatePath(target: string): Promise<ValidationResult> {
  const scripts = await findFiles(target, ".ic10");
  const scenarioFiles = await scenariosForTarget(target, scripts);
  const checks = await Promise.all(
    scripts.map(async (file) => checkSource(await readFile(file, "utf8"), file)),
  );
  const scenarios: ScenarioResult[] = [];
  const scenarioErrors: ValidationResult["scenarioErrors"] = [];

  for (const scenario of scenarioFiles) {
    try {
      scenarios.push(await runScenario(scenario));
    } catch (error) {
      scenarioErrors.push({
        scenario,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { checks, scripts, scenarios, scenarioErrors };
}

function reportChecks(results: CheckResult[]): number {
  let failures = 0;
  for (const result of results) {
    for (const error of result.errors) {
      if (isFailure(error)) {
        console.error(formatError(result.file, error));
        failures += 1;
      }
    }
  }
  if (failures === 0) {
    console.log(`OK: simulator parsed ${results.length} IC10 script${results.length === 1 ? "" : "s"}`);
  }
  return failures;
}

function reportScenarios(results: ScenarioResult[]): number {
  let failures = 0;
  for (const result of results) {
    const displayPath = path.relative(process.cwd(), result.scenario) || result.scenario;
    if (result.failures.length === 0) {
      console.log(`OK: ${displayPath} (${result.stepsExecuted} steps)`);
      continue;
    }
    failures += result.failures.length;
    for (const failure of result.failures) console.error(`${displayPath}: ${failure}`);
  }
  return failures;
}

function usage(): string {
  return [
    "Usage:",
    "  bun run tools/sim_ic10.ts validate [directory]",
    "  bun run tools/sim_ic10.ts check [file-or-directory]",
    "  bun run tools/sim_ic10.ts run <scenario.json> [...]",
  ].join("\n");
}

export async function runCli(args: string[]): Promise<number> {
  const [command, ...rest] = args;
  if (command === "check") {
    const target = await resolveTarget(rest[0] ?? "scripts");
    const results = await checkPath(target);
    const failures = reportChecks(results);
    if (failures > 0) {
      console.error(`FAILED: ${failures} simulator error(s)`);
      return 1;
    }
    return 0;
  }

  if (command === "run" && rest.length > 0) {
    const results: ScenarioResult[] = [];
    for (const file of rest) {
      results.push(await runScenario(file));
    }
    const failures = reportScenarios(results);
    return failures === 0 ? 0 : 1;
  }

  if (command === "validate") {
    const target = await resolveTarget(rest[0] ?? "scripts");
    const result = await validatePath(target);
    let failures = reportChecks(result.checks) + reportScenarios(result.scenarios);
    for (const error of result.scenarioErrors) {
      console.error(`${error.scenario}: ${error.message}`);
      failures += 1;
    }

    const coveredScripts = new Set(result.scenarios.map((scenario) => scenario.script));
    console.log(
      `Scenario coverage: ${coveredScripts.size}/${result.scripts.length} scripts ` +
      `(${result.scenarios.length} scenario${result.scenarios.length === 1 ? "" : "s"})`,
    );
    if (coveredScripts.size < result.scripts.length) {
      console.log("NOTE: scripts without scenarios still receive static validation");
    }
    if (failures > 0) console.error(`FAILED: ${failures} simulator error(s)`);
    return failures === 0 ? 0 : 1;
  }

  console.error(usage());
  return 2;
}

if (import.meta.main) {
  process.exitCode = await runCli(process.argv.slice(2));
}
