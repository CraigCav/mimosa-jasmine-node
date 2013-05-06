mimosa-jasmine-node
===========

## Overview
This is a Mimosa module for starting up a Jasmine-Node test suite alongside Mimosa. This enables mimosa to give you instant feedback on your tests whenever your code changes. 

For more information regarding Mimosa, see http://mimosajs.com

For more information regarding Jasmine, see https://github.com/pivotal/jasmine

For more information regarding Jasmine-Node, see https://github.com/mhevery/jasmine-node

## Usage

Add `'mimosa-jasmine-node'` to your list of modules.  Mimosa will install the module for you when you start up.

Design notes, pay no attention

* spawn jasmine node
* inline the test results, simple output format if possible, keep minimal
* Make config-less with config options in mimosaconfig rather than external file location
* need to clean up jasmine test suite after reporting test results
* need to hook into mimosas watch functionailty to monitor test/spec dirs and src dirs

##License

MIT license - [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)