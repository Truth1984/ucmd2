const { yargs, h } = require("./head");
const fs = require("fs");
for (let i of fs.readdirSync(__dirname + "/middleware")) require(__dirname + "/middleware/" + i);

yargs.help.helpDoc = h.compile();
yargs._execution = h.compileExecute();
yargs.run();
