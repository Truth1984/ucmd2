const { h, cmd, u, un, cu } = require("../head");
h.addEntry("ini", "parse ini file to json and vice-versa", {
  "[0],-f,--file": "file location to workwith",
  "-m,--merge": "merge json data to ini",
  "-i,--insert": "insert json into category",
  "-p,--print": "print json result",
})
  .addLink(
    { _: 0, args: "f", kwargs: "file" },
    { args: "m", kwargs: "merge" },
    { args: "i", kwargs: "insert" },
    { args: "p", kwargs: "print" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let file = args.f;
    let merge = args.m;
    let print = args.p;

    if (!un.fileExist(file[0])) return cu.cmderr("Error: file does not exist", "ini");
    file = file[0];
    cmd(`sudo chmod 777 ${file}`);
    let content = cu.iniParser(un.fileReadSync(file));
    if (print) console.log(content);

    if (merge) return un.fileWriteSync(cu.iniWriter(u.mapMerge(content, cu.jsonParser(merge[0]))), false, file);
  });
