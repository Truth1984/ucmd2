#!/usr/bin/env node
const u = require("awadau");
const cu = require("cmdline-util");
const cmd = require("../helper/_cmd");
let { yargs, h } = require("./test");

yargs.help.helpDoc = h.compile();
yargs._execution = h.compileExecute();
yargs.run();
