const { h, cmd } = require("../head");

h.addEntry("ip", "find local ip address", {
  "": "find inet of web interface",
  "-p,--public": "port number or process name",
})
  .addLink({ args: "p", kwargs: "public" })
  .addAction((argv) => {
    let args = argv.args;
    if (args.p) return cmd(`curl ident.me`);

    return cmd("ifconfig | grep inet", true);
  });
