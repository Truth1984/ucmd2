const { h, cmd, u, cu, un } = require("../head");
const os = require("os");

h.addEntry("os", "find your os name", {
  "-i,--is": "is it ... ? can be win | linux | mac | centos ...",
  "-v,--version": "find versions",
  "-n,--codename": "codename for ubuntu / debian",
})
  .addLink({ _: 0, args: "i", kwargs: "is" }, { args: "v", kwargs: "find" }, { args: "c", kwargs: "codename" })
  .addAction((argv) => {
    let args = argv.args;
    let is = args.i;
    let version = args.v;
    let codename = args.c;

    let check = (name) => {
      if (name == "win") return os.platform() == "win32";
      if (name == "linux") return os.platform() == "linux";
      if (name == "mac") return os.platform() == "darwin";
      if (u.contains(["apt", "rpm", "deb", "yum", "dnf"], name)) return cmd(`command -v ${name}`, 0, 1, 1).status == 0;

      if (os.platform() != "linux") cu.cmderr("system is not linux based", "os");
      let content = un.fileReadSync("/etc/os-release").toLowerCase();
      return u.contains(content, name);
    };

    if (is) return console.log(check(is[0]));
    if (version) {
      if (check("linux")) return cmd("env -i bash -c '. /etc/os-release; echo $VERSION_ID'");
      if (check("win")) return console.log(os.version());
      if (check("mac")) return cmd("sw_vers -productVersion");
    }
    if (codename) {
      if (check("ubuntu")) return cmd(`env -i bash -c '. /etc/os-release; echo $VERSION_CODENAME'`);
      if (check("debian")) return cmd(`dpkg --status tzdata|grep Provides|cut -f2 -d'-'`);
    }

    console.log({
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      username: os.userInfo().username,
    });
  });
