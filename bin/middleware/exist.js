const { h, un } = require("../head");

h.addEntry("exist", "check if file or direcoty exist", {
  "[0],-p,--path": "path to check",
  "-f,--files": "files only",
  "-d,--directory": "directory only",
})
  .addLink(
    { _: 0, args: "p", kwargs: "path" },
    { $: 0, args: "f", kwargs: "files" },
    { $: 0, args: "d", kwargs: "directory" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let path = args.p;
    let files = args.f;
    let directory = args.d;

    let exist = un.fileExist(path[0]);
    if (!exist) return console.log(false);
    if (files) return console.log(!un.fileIsDir(path));
    if (directory) return console.log(un.fileIsDir(path));
    return console.log(exist);
  });
