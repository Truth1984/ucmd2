const { h, cmd, u, un } = require("../head");
h.addEntry("rpull", "rsync pull with ansible", {
  "-w,--whom": "whom to pull from",
  "-s,--source": "source file path",
  "-t,--target": "target file path",
  "-e,--exclude":
    'exclude file, default to ["/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found","/dest"]',
  "-D,--delete": "delete file after transfer",
  "-C,--compression": "compression, -z option, might be slower",
})
  .addLink(
    { _: 0, args: "w", kwargs: "whom" },
    { _: 1, args: "s", kwargs: "source" },
    { _: 2, args: "t", kwargs: "target" },
    { args: "e", kwargs: "exclude" },
    { args: "D", kwargs: "delete" },
    { args: "C", kwargs: "compression" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let whom = args.w;
    let source = args.s;
    let target = args.t;
    let exclude = args.e
      ? args.e
      : ["/dev/*", "/proc/*", "/sys/*", "/tmp/*", "/run/*", "/mnt/*", "/media/*", "/lost+found", "/dest"];
    let deletes = args.D;
    let compression = args.C;

    let users = un.ansibleUserList(whom[0]);
    let opt = `--exclude ${u.arrayToString(exclude, " ")} ${deletes ? "--delete " : ""}`;

    for (let i of users) {
      let data = un.ansibleInventoryData(i);
      let port = data.ansible_port ? data.ansible_port : 22;
      let username = data.ansible_user ? data.ansible_user : "root";
      let addr = data.addr ? data.addr : i;

      let rArg = "-aAXvPh";
      if (compression) rArg += "z";

      let targetdir = un.filePathNormalize(process.env.PWD, target, i);
      await un.fileMkdir(targetdir, true);
      cmd(`rsync ${rArg} -e 'ssh -p ${port}' ${opt} ${username + "@" + addr}:'${source}' ${targetdir}`, true);
    }
  });
