'use strict';
const semver = require('semver')
const path = require('path')
const userHome = require('user-home')
const colors = require('colors/safe')
const pathExists = require('path-exists').sync
const log = require('@deer-cli/log')
const pkg = require('../package.json')
const constant = require('./const')

function core() {
  try {
    checkPkgVersion(); 
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
  } catch (e) {
    log.error(e.message);
  }
}


function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
      dotenv.config({
        path: dotenvPath,
    });
  }
  process.env.CLI_HOME_PATH = process.env.CLI_HOME && path.join(userHome, process.env.CLI_HOME) || path.join(userHome, constant.DEFAULT_CLI_HOME);
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}
function checkRoot() {
  //process.geteuid()   查看文件权限，root为0
  const rootCheck = require('root-check');
  rootCheck();
}

function checkNodeVersion() {
  const currentNodeVersion = process.version;
  const lowNodeVersion = constant.LOW_NODE_VERSION;
  if(!semver.gte(currentNodeVersion,lowNodeVersion)) {
    throw new Error(`deer-cli 需要安装 v${lowNodeVersion}以上的Node.js版本`)
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version);
}


module.exports = core;