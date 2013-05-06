"use strict"

exports.defaults = function() {
  return { 
    jasmine_node: {
    } 
  };
};

exports.placeholder = function() {
  return "\t\n\n"+
         "  # jasmine_node:                     # Configuration for executing tests via jasmine node\n" + 
         "    # specFolders: []                 # \n";
};

exports.validate = function(config, validators) {
  var errors = [];
  return errors;
};
