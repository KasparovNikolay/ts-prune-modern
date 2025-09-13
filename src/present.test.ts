import { State } from "./state";
import { AnalysisResultTypeEnum } from "./analyzer";
import { present } from "./presenter";

describe("present", () => {
  describe("when given state with unused exports", () => {
    const state = new State();

    [
      {
        type: AnalysisResultTypeEnum.POTENTIALLY_UNUSED,
        symbols: [{ name: "foo", line: 0, usedInModule: false }],
        file: "foo.ts",
      },
      {
        type: AnalysisResultTypeEnum.POTENTIALLY_UNUSED,
        symbols: [{ name: "bar", line: 0, usedInModule: false }],
        file: "bar.ts",
      },
    ].forEach((result) => state.onResult(result));

    it("should produce a presentable output", () => {
      expect(JSON.stringify(present(state))).toMatchInlineSnapshot(
        `"[\\"\\\\u001b[32mfoo.ts\\\\u001b[39m:\\\\u001b[33m0\\\\u001b[39m - \\\\u001b[36mfoo\\\\u001b[39m\\",\\"\\\\u001b[32mbar.ts\\\\u001b[39m:\\\\u001b[33m0\\\\u001b[39m - \\\\u001b[36mbar\\\\u001b[39m\\"]"`
      );
    });
  });

  describe("when given state with no unused exports", () => {
    const state = new State();

    [
      {
        type: AnalysisResultTypeEnum.POTENTIALLY_UNUSED,
        symbols: [{ name: "foo", line: 0, usedInModule: false }],
        file: "foo.ts",
      },
      {
        type: AnalysisResultTypeEnum.DEFINITELY_USED,
        symbols: [{ name: "foo", line: 0, usedInModule: false }],
        file: "foo.ts",
      },
    ].forEach((result) => state.onResult(result));

    it("should produce an empty output", () => {
      expect(JSON.stringify(present(state))).toBe(JSON.stringify([]));
    });
  });

  describe("when given state with exports used in own module", () => {
    const state = new State();

    [
      {
        type: AnalysisResultTypeEnum.POTENTIALLY_UNUSED,
        symbols: [{ name: "foo", line: 0, usedInModule: true }],
        file: "foo.ts",
      },
      {
        type: AnalysisResultTypeEnum.POTENTIALLY_UNUSED,
        symbols: [{ name: "bar", line: 0, usedInModule: false }],
        file: "bar.ts",
      },
    ].forEach((result) => state.onResult(result));

    it("should produce a presentable output", () => {
      expect(JSON.stringify(present(state))).toMatchInlineSnapshot(
        `"[\\"\\\\u001b[32mfoo.ts\\\\u001b[39m:\\\\u001b[33m0\\\\u001b[39m - \\\\u001b[36mfoo\\\\u001b[39m\\\\u001b[90m (used in module)\\\\u001b[39m\\",\\"\\\\u001b[32mbar.ts\\\\u001b[39m:\\\\u001b[33m0\\\\u001b[39m - \\\\u001b[36mbar\\\\u001b[39m\\"]"`
      );
    });
  });
});
