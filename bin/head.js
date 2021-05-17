const yargslite = require("yargs-lite");
const Helpdoc = require("../helper/help");
const cmd = require("../helper/_cmd");
const cu = require("cmdline-util");
const u = require("awadau");
const un = require("backend-core").un;

let yargs = new yargslite();
let h = new Helpdoc("u", "Author: Awada.Z");

module.exports = { yargs, h, cmd, cu, u, un };
