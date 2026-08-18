import {
  Define,
  DefineInstruction,
  RealContext,
  parseArgumentAnyNumber,
  type InstructionArgument,
} from "@stationeers-ic/ic10";

/**
 * @stationeers-ic/ic10 0.3.7 treats a parsed define value as a boolean, which
 * rejects the valid numeric value zero. Keep the workaround isolated and
 * delete it after upgrading to a release that accepts `define NAME 0`.
 */
const originalArgumentList = DefineInstruction.prototype.argumentList;

DefineInstruction.prototype.argumentList = function patchedArgumentList(): InstructionArgument[] {
  const rules = originalArgumentList.call(this);
  const valueRule = rules[1];
  if (!valueRule) return rules;

  const originalCalculate = valueRule.calculate;
  rules[1] = {
    ...valueRule,
    calculate: function calculateDefineValue(context, argument) {
      if (parseArgumentAnyNumber(context, argument) === 0) {
        return new Define("const", 0);
      }
      return originalCalculate.call(this, context, argument);
    },
  };
  return rules;
};

/**
 * Version 0.3.7 saves the jal instruction's own line in ra. Stationeers saves
 * the following line, which is required for the conventional `j ra` return.
 */
const originalSetNextLineIndex = RealContext.prototype.setNextLineIndex;

RealContext.prototype.setNextLineIndex = function patchedSetNextLineIndex(
  index?: number,
  writeRA = false,
): void {
  if (!writeRA) {
    originalSetNextLineIndex.call(this, index, false);
    return;
  }

  const ra = this.getDefines("ra")?.value;
  if (typeof ra !== "string" || !/^r\d+$/.test(ra)) {
    originalSetNextLineIndex.call(this, index, true);
    return;
  }

  this.setRegister(Number(ra.slice(1)), this.getNextLineIndex() + 1);
  originalSetNextLineIndex.call(this, index, false);
};
