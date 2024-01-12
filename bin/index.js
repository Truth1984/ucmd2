#!/usr/bin/env node
const { yargs, h, u, un } = require("./head");
const fs = require("fs");
let entry = u.arrayExtract(process.argv, 2)[0];

if (entry == "--help") {
  for (let i of fs.readdirSync(__dirname + "/middleware")) require(__dirname + "/middleware/" + i);
} else {
  require(__dirname + "/middleware/_debug.js");
  require(__dirname + "/middleware/_test.js");
  let dir = __dirname + "/middleware/" + entry + ".js";
  if (un.fileExist(dir)) require(dir);
}

yargs.help.helpDoc = h.compile();
yargs._execution = h.compileExecute();
yargs.run();
