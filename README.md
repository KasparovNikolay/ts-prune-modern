# ts-prune

Find potentially unused exports in your Typescript project with zero configuration.

[![asciicast](https://asciinema.org/a/liQKNmkGkedCnyHuJzzgu7uDI.svg)](https://asciinema.org/a/liQKNmkGkedCnyHuJzzgu7uDI) [![Join the chat at https://gitter.im/ts-prune/community](https://badges.gitter.im/ts-prune/community.svg)](https://gitter.im/ts-prune/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Getting Started

`ts-prune` exposes a cli that reads your tsconfig file and prints out all the unused exports in your source files.

### Installing

Install ts-prune with yarn or npm

```sh
# npm
npm install ts-prune --save-dev
# yarn
yarn add -D ts-prune
```

### Usage

You can install it in your project and alias it to a npm script in package.json.

```json
{
  "scripts": {
    "find-deadcode": "ts-prune"
  }
}
```

If you want to run against different Typescript configuration than tsconfig.json:

```sh
ts-prune -p tsconfig.dev.json
```

### Examples

- [gatsby-material-starter](https://github.com/Vagr9K/gatsby-material-starter/blob/bdeba4160319c1977c83ee90e035c7fe1bd1854c/themes/material/package.json#L147)
- [DestinyItemManager](https://github.com/DestinyItemManager/DIM/blob/aeb43dd848b5137656e6f47812189a2beb970089/package.json#L26)

#### Monorepo Usage

For monorepos, you can use the `--scope` option to limit analysis to a specific package, improving performance by avoiding analysis of the entire monorepo:

```bash
# Analyze only the current package
ts-prune --scope .

# Analyze a specific package in a monorepo
ts-prune --scope packages/my-package

# Analyze with scope and other options
ts-prune --scope packages/my-package --skip "\.test\.ts$" --error
```

This is particularly useful in monorepos where you want to find unused exports within a specific package without considering usage from other packages in the monorepo.

#### Performance Optimization

For large projects, you can use several options to improve performance:

```bash
# Enable parallel processing for faster analysis
ts-prune --parallel

# Show performance metrics to monitor analysis speed
ts-prune --performance

# Combine scope and parallel processing for maximum performance
ts-prune --scope packages/my-package --parallel --performance

# Use caching (enabled by default) and parallel processing
ts-prune --parallel --performance --skip "\.test\.ts$"
```

**Performance Tips:**

- Use `--scope` to limit analysis to specific directories
- Enable `--parallel` for projects with many files
- Use `--performance` to monitor and optimize analysis speed
- Caching is enabled by default and significantly improves repeated runs

### Configuration

ts-prune supports CLI and file configuration via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig#usage) (all file formats are supported).

#### Configuration options

- `-p, --project` - **tsconfig.json** path(`tsconfig.json` by default)
- `-i, --ignore` - errors ignore RegExp pattern
- `-e, --error` - return error code if unused exports are found
- `-s, --skip` - skip these files when determining whether code is used. (For example, `.test.ts?` will stop ts-prune from considering an export in test file usages)
- `-u, --unusedInModule` - skip files that are used in module (marked as `used in module`)
- `--scope` - limit analysis to files within the specified directory path (useful for monorepos)
- `--parallel` - enable parallel processing for better performance (experimental)
- `--performance` - show performance metrics and timing information

CLI configuration options:

```bash
ts-prune -p my-tsconfig.json -i my-component-ignore-patterns?
```

Configuration file example `.ts-prunerc`:

```json
{
  "ignore": "my-component-ignore-patterns?"
}
```

### FAQ

#### How do I get the count of unused exports?

```sh
ts-prune | wc -l
```

#### How do I ignore a specific path?

You can either,

##### 1. Use the `-i, --ignore` configuration option:

```sh
ts-prune --ignore 'src/ignore-this-path'
```

##### 2. Use `grep -v` to filter the output:

```sh
ts-prune | grep -v src/ignore-this-path
```

#### How do I ignore multiple paths?

You can either,

##### 1. Use the `-i, --ignore` configuration option:

```sh
ts-prune --ignore 'src/ignore-this-path|src/also-ignore-this-path'
```

##### 2. Use multiple `grep -v` to filter the output:

```sh
ts-prune | grep -v src/ignore-this-path | grep -v src/also-ignore-this-path
```

#### How do I ignore a specific identifier?

You can either,

##### 1. Prefix the export with `// ts-prune-ignore-next`

```ts
// ts-prune-ignore-next
export const thisNeedsIgnoring = foo;
```

##### 2. Use `grep -v` to ignore a more widely used export name

```sh
ts-prune | grep -v ignoreThisThroughoutMyCodebase
```

### Acknowledgements

- The excellent [ts-morph](https://github.com/dsherret/ts-morph) library. And [this gist](https://gist.github.com/dsherret/0bae87310ce24866ae22425af80a9864) by [@dsherret](https://github.com/dsherret).
