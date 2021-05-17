const { h, cmd, cu, un } = require("../head");

h.addEntry("quick", "record command into quick folder", {
  "[0],-n,--name": "name of quick command",
  "-c,--command": "command to record",
  "-d,--display": "display commands in a table",
  "-r,--remove": "remove command",
  "-a,--append": "replace ... with value, then add to end if ... not exist",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "c", kwargs: "command" },
    { args: "d", kwargs: "display" },
    { args: "r", kwargs: "remove" },
    { args: "a", kwargs: "append" }
  )
  .addAction(async (argv) => {
    let quickPath = un.filePathNormalize(__dirname, "../../quick");
    await un.fileMkdir(quickPath, true);

    let args = argv.args;
    let name = args.n;
    let command = args.c;
    let display = args.d;
    let remove = args.r;
    let append = args.a;

    if (display)
      return un.fileReaddir(quickPath).then((aom) => {
        let result = {};
        for (let i of aom) result[i.basename] = un.fileReadSync(i.fullPath);
        console.table(result);
      });

    if (remove) {
      if (un.fileExist(fullPath)) await un.fileDelete(fullPath);
      return cmd(`u quick --display`);
    }

    let fullPath = un.filePathNormalize(quickPath, name);

    if (command) un.fileWriteSync(command, false, fullPath);

    let qcmd = un.fileExist(fullPath)
      ? un.fileReadSync(fullPath)
      : cu.cmderr(`quick command <${name}> not found`, "quick");
    if (append)
      for (let i of append) {
        if (qcmd.indexOf("...") > -1) {
          qcmd = qcmd.replace("...", i);
        } else {
          qcmd += ` ${i}`;
        }
      }
    cmd(qcmd, true);
  });
