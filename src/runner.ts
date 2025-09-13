import path from "path";
import JSON5 from "json5";
import fs from "fs";

import { analyze, analysisCache } from "./analyzer";
import { initialize } from "./initializer";
import { State } from "./state";
import { present, USED_IN_MODULE } from "./presenter";
import { IConfigInterface } from "./configurator";

export const run = (config: IConfigInterface, output = console.log) => {
  const startTime = process.hrtime.bigint();
  
  const tsConfigPath = path.resolve(config.project!);
  const { project } = initialize(tsConfigPath, config.scope);
  const tsConfigJSON = JSON5.parse(fs.readFileSync(tsConfigPath, "utf-8"));

  const entrypoints: string[] =
    tsConfigJSON?.files?.map((file: string) =>
      path.resolve(path.dirname(tsConfigPath), file)
    ) || [];

  const state = new State();

  const analysisStartTime = process.hrtime.bigint();
  analyze(project, state.onResult, entrypoints, config.skip, config.scope, config.parallel);
  const analysisEndTime = process.hrtime.bigint();

  const presented = present(state);

  const filterUsedInModule = config.unusedInModule !== undefined ? presented.filter(file => !file.includes(USED_IN_MODULE)) : presented;
  const filterIgnored = config.ignore !== undefined ? filterUsedInModule.filter(file => !file.match(config.ignore!)) : filterUsedInModule;

  filterIgnored.forEach(value => {
    output(value);
  });

  const endTime = process.hrtime.bigint();
  
  if (config.performance) {
    const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const analysisTime = Number(analysisEndTime - analysisStartTime) / 1000000;
    const fileCount = project.getSourceFiles().length;
    
    output(`\n📊 Performance Metrics:`);
    output(`   Files analyzed: ${fileCount}`);
    output(`   Total time: ${totalTime.toFixed(2)}ms`);
    output(`   Analysis time: ${analysisTime.toFixed(2)}ms`);
    output(`   Time per file: ${(analysisTime / fileCount).toFixed(2)}ms`);
    output(`   Cache hits: ${analysisCache.size > 0 ? 'Enabled' : 'Disabled'}`);
    output(`   Parallel processing: ${config.parallel ? 'Enabled' : 'Disabled'}`);
  }

  return filterIgnored.length;
};
