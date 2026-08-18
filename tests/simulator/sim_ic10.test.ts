import { describe, expect, test } from "bun:test";
import path from "node:path";

import { ErrorSeverity } from "@stationeers-ic/ic10";

import { checkSource, runScenario, validatePath } from "../../tools/sim_ic10";

describe("IC10 static checks", () => {
  test("accepts valid instructions, aliases, and labels", async () => {
    const result = await checkSource([
      "alias VALUE r0",
      "define TARGET 42",
      "define ZERO 0",
      "move VALUE TARGET",
      "done:",
      "j done",
    ].join("\n"));

    expect(result.errors.filter((error) => error.severity === ErrorSeverity.Strong)).toEqual([]);
  });

  test("rejects unknown instructions", async () => {
    const result = await checkSource("explode r0");

    expect(result.errors.some((error) => error.severity === ErrorSeverity.Strong)).toBe(true);
  });

  test("rejects invalid argument counts", async () => {
    const result = await checkSource("add r0 r1");

    expect(result.errors.some((error) => error.severity === ErrorSeverity.Strong)).toBe(true);
  });
});

describe("IC10 scenarios", () => {
  test("executes code against a connected device", async () => {
    const scenario = path.join(import.meta.dir, "fixtures", "basic.sim.json");
    const result = await runScenario(scenario);

    expect(result.stepsExecuted).toBe(5);
    expect(result.failures).toEqual([]);
  });

  test("automatically discovers scenarios", async () => {
    const fixtures = path.join(import.meta.dir, "fixtures");
    const result = await validatePath(fixtures);

    expect(result.scripts).toHaveLength(3);
    expect(result.scenarios).toHaveLength(3);
    expect(result.scenarioErrors).toEqual([]);
  });

  test("applies external changes after a physical-line step", async () => {
    const scenario = path.join(import.meta.dir, "fixtures", "change.sim.json");
    const result = await runScenario(scenario);

    expect(result.stepsExecuted).toBe(2);
    expect(result.failures).toEqual([]);
  });

  test("returns from jal to the following line", async () => {
    const scenario = path.join(import.meta.dir, "fixtures", "jal.sim.json");
    const result = await runScenario(scenario);

    expect(result.stepsExecuted).toBe(6);
    expect(result.failures).toEqual([]);
  });
});
