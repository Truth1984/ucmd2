const { h, un } = require("../head");

h.addEntry("exist", "check if file or direcoty exist", {
  "-p,--path": "path to check",
  "-f,--files": "files only",
  "-d,--directory": "directory only",
})
  .addLink({ _: 0, args: "p", kwargs: "path" }, { args: "f", kwargs: "files" }, { args: "d", kwargs: "directory" })
  .addAction((argv) => {
    let args = argv.args;
    let path = args.p;
    let files = args.f;
    let directory = args.d;

    let exist = un.fileExist(path[0]);
    if (!exist) return console.log(false);
    if (files) return console.log(!un.fileIsDir(argv.p));
    if (directory) return console.log(un.fileIsDir(argv.p));
    return console.log(exist);
  });
