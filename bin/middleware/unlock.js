const { h, cmd } = require("../head");

h.addEntry("unlock", "check which process is using the lock", {
  "-p,--path": "path of the locked file",
  "-P,--port": "port to unlock in selinux, may use setenforce 0;",
})
  .addLink({ _: 0, args: "p", kwargs: "path" }, { args: "P", kwargs: "port" })
  .addAction((argv) => {
    let args = argv.args;
    let path = args.p;
    let port = args.P;

    if (port) return cmd(`sudo semanage port -a -t http_port_t  -p tcp ${port}`);

    return cmd(`sudo fuser -v ${path} && sudo chattr -iau ${path}`);
  });
