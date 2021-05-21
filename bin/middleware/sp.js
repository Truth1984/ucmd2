const { h, cmd, cu, u } = require("../head");
h.addEntry("sp", "shell parser for commands", {
  "[0],-c,--command": "command to parse",
  "-s,--separator": "separator, default to '/\\s+/'",
  "-h,--head": "head to skip",
  "-t,--tail": "tail to skip",
  "-H,--header": "header to provide",
  "-l,--line": "line spliter, default to '\\n'",
  "-R,--rest": "rest , add $REST$ column default to 'false'",
})
  .addLink(
    { _: 0, args: "c", kwargs: "command" },
    { args: "s", kwargs: "separator" },
    { args: "h", kwargs: "head" },
    { args: "t", kwargs: "tail" },
    { args: "H", kwargs: "header" },
    { args: "l", kwargs: "line" },
    { args: "R", kwargs: "rest" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let command = args.c;
    let separator = args.s;
    let head = args.h;
    let tail = args.t;
    let header = args.H;
    let line = args.l ? args.l : "\n";
    let rest = args.R;

    let result = cmd(command[0], 0, 1, 1);
    if (result.status > 0) return console.log(result.stdout);
    result = result.stdout;

    let option = { lineSpliter: line[0] };
    if (separator) option = u.mapMerge(option, { separator: separator[0] });
    if (head) option = u.mapMerge(option, { skipHead: head[0] });
    if (tail) option = u.mapMerge(option, { skipTail: tail[0] });
    if (header) option = u.mapMerge(option, { selfProvideHeader: header });
    if (rest) option = u.mapMerge(option, { REST: true });

    console.log(cu.shellParser(result, option));
  });
