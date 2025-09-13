#!/usr/bin/env node
export { IConfigInterface } from "./configurator";
export { run } from "./runner";
export { ResultSymbol } from "./analyzer";

import { getConfig } from "./configurator";
import { run } from "./runner";

const config = getConfig();
run(config).then((resultCount) => {
  if (resultCount > 0 && config.error) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
