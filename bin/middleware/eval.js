const { h, cmd, u, un, cu } = require("../head");
h.addEntry("eval", "eval for nodejs", { "-l,--line": "line to eval" })
  .addLink({ _: 0, args: "l", kwargs: "line" })
  .addAction((argv) => {
    let args = argv.args;
    let line = args.l;

    return console.log(eval("(" + line + ")"));
  });
