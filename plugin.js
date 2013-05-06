"use strict"

var watch = require('chokidar'),
    logger = require('logmimosa');

var registration = function(config, register) {
  var e,
      specFolders = config.jasmine_node.specFolders;

  if (config.isWatch) {
    e = config.extensions;
    register(['postBuild'], 'beforePackage', _runTests);
    register(['add','update','remove'], 'afterOptimize', _runTests, e.javascript);

    _addWatch(specFolders, config);
  }
};

var _runTests = function(config, options, next) {
  var jasmine = require('jasmine-node');

  //TODO: figure out a better way to clean up after reporting test results
  global.jasmine.currentEnv_ = new jasmine.Env();

  jasmine.executeSpecsInFolder(config.jasmine_node);
  next();
};

var _addWatch = function(specFolders, config) {
  var run = function (action) {
    return function (file) {
      logger.info(action + ' file: "' + file + '"');
      _runTests(config, null, function () {});
    };
  };
  specFolders.forEach(function(path) {
    var watcher = watch.watch(path);
    watcher.on('change', run('Changed'));
    watcher.on('unlink', run('Removed'));
    watcher.on('add', run('Added'));
  });
};

module.exports = {
  registration: registration
};