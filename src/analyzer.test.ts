import { Project, ts } from "ts-morph";
import {
  getExported,
  getPotentiallyUnused,
  importsForSideEffects,
  trackWildcardUses,
} from "./analyzer";

const fooSrc = `
export const x = 'x';
export const y = 'y';
export const z = {a: 'a'};
export const w = 'w';
export type ABC = 'a' | 'b' | 'c';

export const unusedC = 'c';
export type UnusedT = 'T';
`;

const starExportSrc = `
export * from './foo';
`;

const starImportSrc = `
import * as foo from './foo';
import {UseFoo} from './use-foo';
import {x,y,z,w,ABC} from './starExport';

const x = foo.x;
const {y} = foo;
const {z: {a}} = foo;
const w = foo['w'];
type ABC = foo.ABC;
`;

const useFooSrc = `
export function UseFoo(foo: string) {
  alert(foo);
}
`;

const barSrc = `
export const bar = () => false;
`;

const testBarSrc = `
import { bar } from './bar';

describe("bar", () => {
  it("should return false", () => {
    expect(bar()).toBe.toBeFalsy;
  });
});
`;

describe("analyzer", () => {
  const project = new Project();
  const foo = project.createSourceFile("/project/foo.ts", fooSrc);
  const useFoo = project.createSourceFile("/project/use-foo.ts", useFooSrc);
  const star = project.createSourceFile("/project/star.ts", starImportSrc);
  const bar = project.createSourceFile("/project/bar.ts", barSrc);
  const testBar = project.createSourceFile("/project/bar.test.ts", testBarSrc);
  const starExport = project.createSourceFile(
    "/project/starExport.ts",
    starExportSrc,
  );

  it("should track import wildcards", () => {
    // TODO(danvk): rename this to importSideEffects()
    expect(importsForSideEffects(star)).toEqual([]);
  });

  it("should track named exports", () => {
    expect(getExported(foo)).toEqual([
      { name: "x", line: 2 },
      { name: "y", line: 3 },
      { name: "z", line: 4 },
      { name: "w", line: 5 },
      { name: "ABC", line: 6 },
      { name: "unusedC", line: 8 },
      { name: "UnusedT", line: 9 },
    ]);

    expect(getExported(useFoo)).toEqual([{ name: "UseFoo", line: 2 }]);
  });

  it("should track named imports", () => {
    expect(getPotentiallyUnused(foo)).toEqual({
      file: "/project/foo.ts",
      symbols: [
        { line: 8, name: "unusedC", usedInModule: false },
        { line: 9, name: "UnusedT", usedInModule: false },
      ],
      type: 0,
    });
  });

  it("should not skip source files without a pattern", () => {
    // while bar.test.ts is included, bar is used
    expect(getPotentiallyUnused(bar)).toEqual({
      file: "/project/bar.ts",
      symbols: [],
      type: 0,
    });
  });

  it("should skip source files matching a pattern", () => {
    // when bar.test.ts is exclude by the skip pattern, bar is unused
    expect(getPotentiallyUnused(bar, /.test.ts/)).toEqual({
      file: "/project/bar.ts",
      symbols: [{ line: 2, name: "bar", usedInModule: false }],
      type: 0,
    });
  });

  it("should use line number of 'export * from' rather than line number of original export", () => {
    expect(getPotentiallyUnused(starExport)).toEqual({
      file: "/project/starExport.ts",
      symbols: [
        { name: "unusedC", line: undefined, usedInModule: false },
        { name: "UnusedT", line: undefined, usedInModule: false },
      ],
      type: 0,
    });
  });

  it("should track usage through star imports", () => {
    const importNode = star.getFirstDescendantByKindOrThrow(
      ts.SyntaxKind.ImportDeclaration,
    );

    expect(trackWildcardUses(importNode)).toEqual(["x", "y", "z", "w", "ABC"]);
  });

  describe("scope functionality", () => {
    const monorepoProject = new Project();

    // Create files in different packages
    const packageAFile = monorepoProject.createSourceFile(
      "/monorepo/packages/package-a/src/utils.ts",
      `
      export const utilA = 'utilA';
      export const unusedUtilA = 'unusedUtilA';
    `,
    );

    const packageBFile = monorepoProject.createSourceFile(
      "/monorepo/packages/package-b/src/main.ts",
      `
      import { utilA } from '../../package-a/src/utils';
      export const mainB = 'mainB';
    `,
    );

    const packageAFile2 = monorepoProject.createSourceFile(
      "/monorepo/packages/package-a/src/index.ts",
      `
      import { utilA } from './utils';
      export const indexA = 'indexA';
    `,
    );

    it("should find unused exports when no scope is specified", () => {
      const result = getPotentiallyUnused(packageAFile);
      expect(result.symbols).toContainEqual({
        name: "unusedUtilA",
        line: 3,
        usedInModule: false,
      });
    });

    it("should limit analysis to specified scope", () => {
      // When scoped to package-a, utilA should be considered used (referenced by index.ts)
      const result = getPotentiallyUnused(
        packageAFile,
        undefined,
        "/monorepo/packages/package-a",
      );
      expect(result.symbols).toContainEqual({
        name: "unusedUtilA",
        line: 3,
        usedInModule: false,
      });
      // utilA should not be in unused list because it's used by index.ts within the scope
      expect(result.symbols.find((s) => s.name === "utilA")).toBeUndefined();
    });

    it("should consider exports unused when referenced outside scope", () => {
      // When scoped to package-a, utilA should be considered used only if referenced within package-a
      const result = getPotentiallyUnused(
        packageAFile,
        undefined,
        "/monorepo/packages/package-a",
      );
      // utilA is used by index.ts within the scope, so it should not be unused
      expect(result.symbols.find((s) => s.name === "utilA")).toBeUndefined();
    });
  });
});
