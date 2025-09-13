#!/bin/bash

STEP_COUNTER=0
step () {
  STEP_COUNTER=$(($STEP_COUNTER + 1))
  printf "\n$STEP_COUNTER. $1 \n"
}

step "Build ts-prune"
cd "$(dirname "$0")/.."
pnpm build

step "Change to testproject dir"
cd "$(dirname "$0")"
cd testproject

step "Run ts-prune"
node ../../lib/index.js --skip "skip.me" | tee outfile

step "Diff between outputs"
DIFF=$(diff outfile ../outfile.base)
EXIT_CODE=2
if [ "$DIFF" != "" ]
then
  echo "The output was not the same as the base"
  echo "---"
  diff outfile ../outfile.base
  echo "---"
  EXIT_CODE=1
else
  echo "Everything seems to be match! 🎉"
  EXIT_CODE=0
fi

step "Run ts-prune with --unusedInModule option"
node ../../lib/index.js --skip "skip.me" --unusedInModule | tee outfile_unusedInModules

step "Diff between outputs"
DIFF=$(diff outfile_unusedInModules ../outfile_unusedInModules.base)
EXIT_CODE=2
if [ "$DIFF" != "" ]
then
  echo "The output was not the same as the base"
  echo "---"
  diff outfile_unusedInModules ../outfile_unusedInModules.base
  echo "---"
  EXIT_CODE=1
else
  echo "Everything seems to be match! 🎉"
  EXIT_CODE=0
fi

step "Test exit code with no error flag"
if ! node ../../lib/index.js > /dev/null; then
  echo "ts-prune with no error flag returned error"
  EXIT_CODE=1
fi

step "Test exit code with error flag"
if node ../../lib/index.js -e > /dev/null; then
  echo "ts-prune with error flag did not return error"
  EXIT_CODE=1
fi

step "Test exit code with invalid config path"
if node ../../lib/index.js -p ./tsconfig.nonexistens.json &> /dev/null; then
  echo "ts-prune with invalid config path didn't return error"
  EXIT_CODE=1
fi

step "Test exit code with relative config path"
if ! node ../../lib/index.js -p ./tsconfig.json > /dev/null; then
  echo "ts-prune with relative config path returned error"
  EXIT_CODE=1
fi

step "Test exit code with absolute config path"
if ! node ../../lib/index.js -p $(pwd)/tsconfig.json > /dev/null; then
  echo "ts-prune with absolute config path returned error"
  EXIT_CODE=1
fi

step "Cleanup"
rm outfile # generated outfile
rm outfile_unusedInModules # generated outfile

echo "🏁"
exit $EXIT_CODE
