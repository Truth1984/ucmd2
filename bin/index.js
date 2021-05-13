#!/usr/bin/env node
const yargslite = require("yargs-lite");
const Helpdoc = require("./help");
const u = require("awadau");

let yargs = new yargslite();
let h = new Helpdoc("u", "Author: Awada.Z");

h.addEntry("display", "display the storage", { "-d": "only display -d value" })
  .addLink([{ _: 0, args: "d", kwargs: "dis" }])
  .addAction((argv) => console.log(argv));

h.addEntry("echo", "echo the command", { "-d": "only display -d value" })
  .addLink([{ _: 0, args: "l", kwargs: "line" }])
  .addAction((argv) => console.log(argv.kwargs.line));

yargs.help.helpDoc = h.compile();
yargs._execution = h.compileExecute();
yargs.run();
