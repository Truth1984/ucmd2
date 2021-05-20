const { h, cmd, u, un, cu } = require("../head");
h.addEntry("dep", "dependency repo modify", {
  "-l,--list": "list dependencies",
  "-r,--remove": "remove target depencies",
})
  .addLink({ args: "l", kwargs: "list" }, { args: "r", kwargs: "remove" })
  .addAction((argv) => {
    let args = argv.args;
    let list = args.l;
    let remove = args.r;

    let pkgPath;
    if (un.fileExist("/etc/debian_version")) pkgPath = "/etc/apt/sources.list.d";
    if (un.fileExist("/etc/redhat-release")) pkgPath = "/etc/yum.repos.d";
    if (!pkgPath) return cu.cmderr("platform not supported on this os", "dep");
    let full = () => un.fileReaddir(pkgPath).then((d) => d.map((i) => i.fullPath));
    if (list) return full().then(console.log);
    if (remove)
      return full().then(async (d) => {
        let processed = d.filter((i) => u.contains(i, remove));
        let target = await cu.multiSelect(processed);
        cmd(`sudo rm -rf ${target}`);
      });
  });
