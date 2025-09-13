import { cosmiconfigSync } from "cosmiconfig";
import { Command } from "commander";
import pick from "lodash/fp/pick";

export interface IConfigInterface {
  project?: string;
  ignore?: string;
  error?: string;
  skip?: string;
  unusedInModule?: string;
  scope?: string;
  parallel?: boolean;
  performance?: boolean;
}

const defaultConfig: IConfigInterface = {
  project: "tsconfig.json",
  ignore: undefined,
  error: undefined,
  skip: undefined,
  unusedInModule: undefined,
  scope: undefined,
  parallel: false,
  performance: false,
};

const onlyKnownConfigOptions = pick(Object.keys(defaultConfig));

export const getConfig = () => {
  const program = new Command();

  program
    .allowUnknownOption() // required for tests passing in unknown options (ex: https://github.com/nadeesha/ts-prune/runs/1125728070)
    .option(
      "-p, --project [project]",
      "TS project configuration file (tsconfig.json)",
      "tsconfig.json",
    )
    .option("-i, --ignore [regexp]", "Path ignore RegExp pattern")
    .option("-e, --error", "Return error code if unused exports are found")
    .option(
      "-s, --skip [regexp]",
      "skip these files when determining whether code is used",
    )
    .option(
      "-u, --unusedInModule",
      "Skip files that are used in module (marked as `used in module`)",
    )
    .option(
      "--scope [path]",
      "Limit analysis to files within the specified directory path (useful for monorepos)",
    )
    .option(
      "--parallel",
      "Enable parallel processing for better performance (experimental)",
    )
    .option("--performance", "Show performance metrics and timing information")
    .parse(process.argv);

  const cliConfig = onlyKnownConfigOptions(program.opts());

  const defaultConfig = {
    project: "tsconfig.json",
  };

  const moduleName = "ts-prune";
  const explorerSync = cosmiconfigSync(moduleName);
  const fileConfig = explorerSync.search()?.config;

  const config: IConfigInterface = {
    ...defaultConfig,
    ...fileConfig,
    ...cliConfig,
  };

  return config;
};
