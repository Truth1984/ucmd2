const yargslite = require("yargs-lite");
const Helpdoc = require("../helper/help");
const cmd = require("../helper/_cmd");

let yargs = new yargslite();
let h = new Helpdoc("u", "Author: Awada.Z");

module.exports = { yargs, h, cmd };
