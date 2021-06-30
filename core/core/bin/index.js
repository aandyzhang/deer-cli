#! /usr/bin/env node

const importLocal = require("import-local");

//优先使用本地的版本
if (importLocal(__filename)) {
  require('npmlog').info('deer-cli','正在使用本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}
