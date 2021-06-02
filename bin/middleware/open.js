const { h, cmd, un, cu } = require("../head");

h.addEntry("open", "open the file or location", {
  "[0],-l,--location": "display all the network connection, default to '.'",
})
  .addLink({ _: 0, args: "l", kwargs: "location" })
  .addAction((argv) => {
    let args = argv.args;
    let location = args.l ? args.l[0] : ".";
    if (!un.fileExist(location)) return cu.cmderr("Target does not exist", "open");
    if (process.platform == "darwin") return cmd(`open ${location}`);
    if (process.platform == "linux") return cmd(`xdg-open ${location}`);
    if (process.platform == "win32") return cmd(`start ${location}`);
  });
