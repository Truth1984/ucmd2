const { h, cmd, un, u } = require("../head");
h.addEntry("rpush", "rsync push with ansible", {
  "-w,--whom": "whom to push to",
  "-s,--source": "source file path",
  "-t,--target": "target file path",
  "-e,--exclude":
    'exclude file, default to ["/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found","/dest"]',
  "-C,--compression": "compression, -z option, might be slower",
})
  .addLink(
    { _: 0, args: "w", kwargs: "whom" },
    { _: 1, args: "s", kwargs: "source" },
    { _: 2, args: "t", kwargs: "target" },
    { args: "e", kwargs: "exclude" },
    { args: "C", kwargs: "compression" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let whom = args.w;
    let source = args.s;
    let target = args.t;
    let exclude = args.e
      ? args.e
      : ["/dev/*", "/proc/*", "/sys/*", "/tmp/*", "/run/*", "/mnt/*", "/media/*", "/lost+found", "/dest"];
    let compression = args.C;

    let users = un.ansibleUserList(whom[0]);

    let opt = `--exclude ${u.arrayToString(exclude, " ")}`;
    let rArg = "-aAXvPh";
    if (compression) rArg += "z";

    for (let i of users) {
      let data = un.ansibleInventoryData(i);
      let port = data.ansible_port ? data.ansible_port : 22;
      let username = data.ansible_user ? data.ansible_user : "root";
      let addr = data.addr ? data.addr : i;

      cmd(`rsync ${rArg} -e 'ssh -p ${port}' ${opt} ${source} ${username + "@" + addr}:'${target}'`, true);
    }
  });
