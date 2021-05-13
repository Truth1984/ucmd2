#!/usr/bin/env node
const yargslite = require("yargs-lite");
const Help = require("./help");
let y = new yargslite();

let help = new Help("u", "self managed scripts");

help.addEntry("display", "display the storage", { "-d": "only display -d value" });

y.help.helpDoc = help.compile();

y.run();
