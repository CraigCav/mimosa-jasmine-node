"use strict"

var watch = require('chokidar'),
    path = require('path'),
    logger = require('logmimosa');

var registration = function(config, register) {
  if (config.isWatch) {
    register(['postBuild'], 'beforePackage', _addWatch);
  }
};

var _runTests = function(config) {
  var jasmine = require('jasmine-node');

  //TODO: figure out a better way to clean up after reporting test results
  global.jasmine.currentEnv_ = new jasmine.Env();

  jasmine.executeSpecsInFolder(config.jasmine_node);
};

var _addWatch = function(config, options, next) {
  //TODO: consider moving these checks to config.js
  var specFolders = config.jasmine_node.specFolders || [];
  var sourceFolders = config.serverReload ? config.serverReload.watch || [] : [];
  var dirsToWatch = specFolders.concat(sourceFolders);
  var serverReloading = false;

  if(!dirsToWatch.length > 0) {
    next();
    return;
  }

  var throttledTestRunner = withTimeout(function () {
    _runTests(config);
  }, config.jasmine_node.throttleTimeout || 100);

  var run = function (action) {
    return function (file) {
      logger.green(action + ' file: "' + path.normalize(file) + '"');

      if(serverReloading) 
        setTimeout(throttledTestRunner, 500);
      else
        throttledTestRunner();            
    };
  };

  var ignoreFiles = function (name) {
    if(config.serverReload && config.serverReload.excludeRegex)
      return name.match(config.serverReload.excludeRegex);

    if(config.serverReload && config.serverReload.exclude)
      return config.serverReload.exclude.indexOf(name) > -1;

    return false;
  };

  watch.watch(sourceFolders, { ignored: ignoreFiles, persistent: true })
    .on('all', function () {
      serverReloading = true;
    });

  var watcher = watch.watch(dirsToWatch, { ignored: ignoreFiles, persistent: true });

  watcher.on('change', run('Changed'));
  watcher.on('unlink', run('Removed'));
  watcher.on('add', run('Watching'));
  watcher.on('error', function (error) {
    //Doing nothing at the moment, just need to trap error event
  });

  next();
};

function withTimeout (func, wait) {
    var throttling = false;
    return function(){
        if ( !throttling ){
            func.apply(this, arguments);
            throttling = true;
            setTimeout(function(){
                throttling = false;
            }, wait);            
        }
    };
}

module.exports = {
  registration: registration
};