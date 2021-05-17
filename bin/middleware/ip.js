const { h, cmd } = require("../head");

h.addEntry("ip", "find local ip address", {
  "[0]": "find inet of web interface",
  "-p,--public": "find public ip address of host",
  "-d,--dns": "dns lookup",
})
  .addLink({ args: "p", kwargs: "public" }, { args: "d", kwargs: "dns" })
  .addAction((argv) => {
    let args = argv.args;
    let public = args.p;
    let dns = args.d;

    if (public) return cmd(`curl ident.me`);
    if (dns) return cmd(`nslookup ${dns}`);

    return cmd("ifconfig | grep inet", true);
  });
