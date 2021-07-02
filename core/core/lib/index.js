'use strict';
const semver = require('semver')
const path = require('path')
const userHome = require('user-home')
const colors = require('colors/safe')
const commander = require('commander');
const pathExists = require('path-exists').sync
const { getNpmSemverVersion } = require('@deer-cli/get-npm-info');
const log = require('@deer-cli/log')
const exec = require('@deer-cli/exec');
const pkg = require('../package.json')
const constant = require('./const')

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec);

  // 开启debug模式
  program.on('option:debug', function() {
    if (program.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 指定targetPath
  program.on('option:targetPath', function() {
    process.env.CLI_TARGET_PATH = program.targetPath;
  });

  // 对未知命令监听
  program.on('command:*', function(obj) {
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.log(colors.red('未知的命令：' + obj[0]));
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  // await checkGlobalUpdate();
}


async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // const npmName = "deer-ui"
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
                更新命令： npm install -g ${npmName}`));
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