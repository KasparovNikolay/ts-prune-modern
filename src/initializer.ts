import { Project } from "ts-morph";
import path from "path";

export const initialize = (tsConfigFilePath: string, scopePath?: string) => {
  const project = new Project({ tsConfigFilePath });

  // If scope is specified, we can optimize by only loading files in that scope
  if (scopePath) {
    const normalizedScopePath = path.resolve(scopePath);
    const sourceFiles = project.getSourceFiles();

    // Filter out files outside the scope to reduce memory usage
    sourceFiles.forEach((file) => {
      const filePath = file.getFilePath();
      if (!filePath.startsWith(normalizedScopePath)) {
        // Remove file from project to reduce memory usage
        project.removeSourceFile(file);
      }
    });
  }

  return {
    project,
  };
};
