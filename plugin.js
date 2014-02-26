'use strict'

var path = require('path'),
    logger;

var registration = function(config, register) {
  if (config.isWatch) {
    logger = config.log;
    register(['postBuild'], 'beforePackage', runJasmineNodeAutotest);
  }
};

var runJasmineNodeAutotest = function(config, options, next) {
  var jasmineConfig = config.jasmine_node;

  var spawn = require('child_process').spawn;

  var specFolders = jasmineConfig.specFolders || ['tests', 'specs'],
      watchFolders = jasmineConfig.watch || ['src'];

  var ps = spawn(process.platform === 'win32' ? 'jasmine-node.cmd' : 'jasmine-node', [
      '--test-dir', specFolders.join(' '),
      '--watch', watchFolders.join(' '),
      jasmineConfig.coffee ? '--coffee': '',
      '--autotest'
    ]);

  if (!ps) {
    console.log('shell jasmine-node failed. Please ensure jasmine-node is installed globally(npm install -g jasmine-node)');
    process.kill();
  }

  ps.stdout.on('data', function(data) {
    console.log('' + data);
  });

  ps.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  ps.on('close', function (code) {
    console.log('child process jasmine-node exited with code ' + code);
  });

  next();
};

module.exports = {
  registration: registration
};
