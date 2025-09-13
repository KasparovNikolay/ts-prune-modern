import { ImportDeclaration, ExportDeclaration } from "ts-morph";

export const getModuleSourceFile = (decl: ImportDeclaration | ExportDeclaration): string | null =>
  decl.getModuleSpecifierSourceFile()?.getFilePath() ?? null;
