"use strict"

var watch = require('chokidar'),
    path = require('path'),
    logger;

var registration = function(config, register) {
  if (config.isWatch) {
    logger = config.log;
    register(['postBuild'], 'beforePackage', _addWatch);
  }
};

var _runTests = function(config) {
  var jasmine = require('jasmine-node');

  //TODO: figure out a better way to clean up after reporting test results
  global.jasmine.currentEnv_ = new jasmine.Env();
  if(config.jasmine_node.coffee == true)
  {
    require("coffee-script");
    var extensions = "js|coffee|litcoffee";
    var match = ".";
    var matchall = false;

    config.jasmine_node.specFolders.forEach(function(path)
    {
      try {
        jasmine.loadHelpersInFolder(path,
          new RegExp("helpers?\\.(" + extensions + ")$", 'i'));
      } catch (error) {
        console.error("Failed loading spec helpers: " + error);
      }
    });

    try {
      config.jasmine_node.regExpSpec = new RegExp(match + (matchall ? "" : "spec\\.") + "(" + extensions + ")$", 'i')
    } catch (error) {
      console.error("Failed to build spec-matching regex: " + error);
    }
  }
  try {
    jasmine.executeSpecsInFolder(config.jasmine_node);
  } catch (error) {
    console.error("Failed running jasmine tests: " + error);
  }
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
