const { h, cmd, u, cu, un } = require("../head");
h.addEntry("json", "parse result to json", {
  "[0],-p,--parse": "parse from string or json",
  "-f,--file": "file to parse",
  "-c,--command": "command line result to json",
  "-s,--shell": "cu.shellParser to perform on --command, takes in {separator,skipHead,skipTail,selfProvideHeader,REST}",
  "-j,--stringify": "stringify the result",
  "-e,--eval": "eval js on object `json`",
})
  .addLink(
    { _: 0, args: "p", kwargs: "parse" },
    { args: "s", kwargs: "shell" },
    { args: "f", kwargs: "file" },
    { args: "c", kwargs: "command" },
    { args: "j", kwargs: "stringify" },
    { args: "e", kwargs: "eval" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let parse = args.p;
    let shell = args.s;
    let file = args.f;
    let command = args.c;
    let stringify = args.j;
    let evals = args.e;

    let json = {};

    if (file) json = cu.jsonParser(un.fileReadSync(file[0]));
    if (parse) json = cu.jsonParser(parse[0]);
    if (command) json = cu.jsonParser(cmd(command[0], 0, 1));
    if (shell) {
      let option = {};
      for (let i of shell) option = u.mapMerge(option, cu.jsonParser(i));
      json = cu.shellParser(json, option);
    }

    if (evals) return console.log(eval("(" + evals[0] + ")"));
    if (stringify) return console.log(u.jsonToString(json, ""));
    console.log(json);
  });
