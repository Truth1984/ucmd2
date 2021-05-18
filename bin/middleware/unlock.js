const { h, cmd } = require("../head");

h.addEntry("unlock", "check which process is using the lock", { "-p,--path": "path of the locked file" })
  .addLink({ _: 0, args: "p", kwargs: "path" })
  .addAction((argv) => {
    let args = argv.args;
    let path = args.p;

    return cmd(`sudo fuser -v ${path} && sudo chattr -iau ${path}`);
  });
