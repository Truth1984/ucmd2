const { h, cmd, u } = require("../head");
h.addEntry("link", "link(ln) particular command to target user group, if command already exist, use $chmod", {
  "-n,--name": "name of the command",
  "-u,--user": "user to use",
  "-r,--remove": "remove link",
})
  .addLink({ _: 0, args: "n", kwargs: "name" }, { args: "u", kwargs: "user" }, { args: "r", kwargs: "remove" })
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let user = args.u ? args.u : "root";
    let remove = args.r;

    let targetPathArr = u.stringToArray(cmd(`sudo -u ${user} sh -c 'echo $PATH'`, false, true), ":");
    let properPath = targetPathArr.filter((i) => u.contains(i, "/bin"))[0];
    if (!properPath) properPath = targetPathArr[0];

    let cmdPath = cmd(`command -v ${name}`, false, true).trim();
    if (remove) {
      cmdPath = cmd(`sudo -u ${user} command -v ${name}`, false, true).trim();
      return cmd(`sudo -u ${user} unlink ${cmdPath}`, true);
    }

    return cmd(`sudo -u ${user} ln -s ${cmdPath} ${properPath}/${name}`, true);
  });
