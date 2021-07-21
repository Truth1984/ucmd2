const { h, u, un, cu } = require("../head");
h.addEntry("replace", "replace a string in the file", {
  "[0],-f,--filename": "filename",
  "[1],-p,--pairs": "pairs, json data",
  "-h,--has": "has, check if file contains particular string",
  "-g,--global": "global /g, param for replace",
  "-t,--test": "test the result",
  "-R,--recursive": "recursive, param for replace",
})
  .addLink(
    { _: 0, args: "f", kwargs: "filename" },
    { _: 1, args: "p", kwargs: "pairs" },
    { args: "h", kwargs: "has" },
    { args: "g", kwargs: "global" },
    { args: "t", kwargs: "test" },
    { args: "R", kwargs: "recursive" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let filename = args.f;
    let pairs = args.p;
    let has = args.h;
    let globals = args.g;
    let test = args.t;
    let recursive = args.R;

    filename = filename[0];

    if (!un.fileExist(filename)) cu.cmderr("Error: file does not exist", "replace");
    let content = un.fileReadSync(filename);
    if (has) return console.log(u.contains(content, has[0]));
    let processed = u.stringReplace(content, cu.jsonParser(pairs[0]), !!recursive, !!globals);
    if (test) return console.log(processed);
    return un.fileWriteSync(processed, false, filename);
  });
