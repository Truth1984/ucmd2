const { h, cmd, u } = require("../head");

h.addEntry("ip", "find local ip address", {
  "[0]": "find inet of web interface",
  "-p,--public": "find public ip address of host",
  "-P,--private": "private ip address",
  "-c,--cidr": "Classless Inter-Domain Routing, specify prefix, default 16",
  "-d,--dns": "dns lookup",
  "-i,--interface": "find main interface",
  "-I,--interfaces": "find all interfaces",
})
  .addLink(
    { args: "p", kwargs: "public" },
    { args: "P", kwargs: "private" },
    { args: "c", kwargs: "cidr" },
    { args: "d", kwargs: "dns" },
    { args: "i", kwargs: "interface" },
    { args: "I", kwargs: "interfaces" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let public = args.p;
    let private = args.P;
    let cidr = args.c;
    let dns = args.d;
    let interface1 = args.i;
    let interfaces = args.I;

    if (public) return cmd(`curl ident.me`);
    if (private) return cmd(`hostname -I | awk '{print $1}'`);
    if (dns) return cmd(`nslookup ${dns}`);
    if (cidr) {
      cidr = cidr[0];
      if (!cidr) cidr = 16;
      let pip = cmd(`hostname -I | awk '{print $1}'`, 0, 1);
      let pa = u.stringToArray(pip, ".");
      if (cidr < 1) return console.log("0.0.0.0/0");
      if (cidr < 9) return console.log(`${pa[0]}.0.0.0/${cidr}`);
      if (cidr < 17) return console.log(`${pa[0]}.${pa[1]}.0.0/${cidr}`);
      if (cidr < 25) return console.log(`${pa[0]}.${pa[1]}.${pa[2]}.0/${cidr}`);
      return console.log(`${pip.trim()}/${cidr}`);
    }

    if (interface1) return cmd(`ip -o link show | awk -F': ' '{print $2}' | grep ens`);
    if (interfaces) return cmd(`ip -o link show | awk -F': ' '{print $2}'`);

    return cmd("ifconfig | grep inet", true);
  });
