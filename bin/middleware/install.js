const { h, cmd, un } = require("../head");
const os = require("os");
h.addEntry("install", "install or upgrade command on different platform", {
  "[0],-n,--name": "name of the package",
  "-l,--list": "list installed package",
  "-c,--clean": "clean",
})
  .addLink({ _: 0, args: "n", kwargs: "name" }, { args: "l", kwargs: "list" }, { args: "c", kwargs: "clean" })
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let list = args.l;
    let clean = args.c;

    let platform = "";
    if (un.fileExist("/etc/debian_version")) platform = "apt";
    if (un.fileExist("/etc/redhat-release")) platform = "yum";
    if (os.platform() == "darwin") platform = "brew";
    if (os.platform() == "win32") platform = "choco";

    if (name) {
      if (platform == "apt") return cmd(`sudo apt-get install -y ${name}`);
      if (platform == "yum") return cmd(`sudo yum install -y ${name}`);
      if (platform == "brew") return cmd(`brew install -y ${name}`);
      if (platform == "choco") return cmd(`choco install -y ${name}`);
    }

    if (list) {
      if (platform == "apt") return cmd(`sudo apt list --installed`);
      if (platform == "yum") return cmd(`sudo yum list installed`);
      if (platform == "brew") return cmd(`brew list`);
      if (platform == "choco") return cmd(`choco list -li`);
    }

    if (clean) {
      if (platform == "apt") return cmd(`sudo apt-get clean`);
      if (platform == "yum") return cmd(`sudo yum clean all`);
      if (platform == "brew") return cmd(`brew cleanup`);
    }
  });
