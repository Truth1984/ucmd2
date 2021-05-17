const { h, cmd } = require("../head");

h.addEntry("open", "open the file or location", {
  "[0],-l,--location": "display all the network connection, default to '.'",
})
  .addLink({ _: 0, args: "l", kwargs: "location" })
  .addAction((argv) => {
    let args = argv.args;
    let location = args.l ? args.l : ".";
    if (process.platform == "darwin") return cmd(`open ${location}`);
    if (process.platform == "linux") cmd(`xdg-open ${location}`);
    if (process.platform == "win32") cmd(`start ${location}`);
  });
