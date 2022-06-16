const { h, cmd, cu, un, u } = require("../head");

h.addEntry("quick", "record command into quick folder", {
  "[0],-n,--name": "name of quick command",
  "-c,--command": "command to record",
  "-d,--display": "display commands in a table",
  "-r,--remove": "remove command",
  "-a,--append": "replace ... with value, then add to end if ... not exist",
  "-e,--edit": "nano script",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "c", kwargs: "command" },
    { args: "d", kwargs: "display" },
    { $: 0, args: "r", kwargs: "remove" },
    { args: "a", kwargs: "append" },
    { $: 0, args: "e", kwargs: "edit" }
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
    let edit = args.e;

    if (display)
      return un.fileReaddir(quickPath).then((aom) => {
        let result = {};
        for (let i of aom) result[i.basename] = un.fileReadSync(i.fullPath);
        console.table(result);
      });

    let fullPath = un.filePathNormalize(quickPath, name[0]);

    if (remove) {
      if (un.fileExist(fullPath)) await un.fileDelete(fullPath);
      return cmd(`u quick --display`);
    }

    if (command) return un.fileWriteSync(command, false, fullPath);

    if (edit && un.fileExist(fullPath)) return cmd(`nano ${fullPath}`);

    let qcmd = un.fileExist(fullPath)
      ? un.fileReadSync(fullPath)
      : cu.cmderr(`quick command <${name}> not found`, "quick");
    if (!append) qcmd = u.stringReplace(qcmd, { "\\.\\.\\.": "" });
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
