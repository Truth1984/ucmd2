const { h, cmd } = require("../head");

h.addEntry("ip", "find local ip address", {
  "[0]": "find inet of web interface",
  "-p,--public": "find public ip address of host",
  "-d,--dns": "dns lookup",
  "-i,--interface": "find main interface",
  "-I,--interfaces": "find all interfaces",
})
  .addLink(
    { args: "p", kwargs: "public" },
    { args: "d", kwargs: "dns" },
    { args: "i", kwargs: "interface" },
    { args: "I", kwargs: "interfaces" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let public = args.p;
    let dns = args.d;
    let interface1 = args.i;
    let interfaces = args.I;

    if (public) return cmd(`curl ident.me`);
    if (dns) return cmd(`nslookup ${dns}`);
    if (interface1) return cmd(`ip -o link show | awk -F': ' '{print $2}' | grep ens`);
    if (interfaces) return cmd(`ip -o link show | awk -F': ' '{print $2}'`);

    return cmd("ifconfig | grep inet", true);
  });
