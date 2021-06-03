const { h, cmd, u } = require("../head");

h.addEntry("network", "live network display", {
  "[0]": "display all the network connection",
  "-d,--device": "device for showing network details",
  "-t,--tcp": "tcp connection status",
  "-l,--list": "list web interfaces details",
  "-c,--connection": "show established connection",
  "-a,--active": "show active established connection, specify network interface",
})
  .addLink(
    { _: 0, args: "d", kwargs: "device" },
    { args: "t", kwargs: "tcp" },
    { args: "l", kwargs: "list" },
    { args: "c", kwargs: "connection" },
    { args: "a", kwargs: "active" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let device = args.d;
    let tcp = args.t;
    let list = args.l;
    let connection = args.c;
    let active = args.a;

    if (list) return cmd("sudo netstat -i");
    if (tcp) return cmd(`sudo tcpdump ${u.len(tcp) > 0 ? "-i " + tcp : tcp}`);
    if (device) return cmd("sudo nethogs " + device);
    if (connection) return cmd(`sudo lsof -i ${u.equal(connection, []) ? "" : "| grep " + connection}`);
    if (active) return cmd(`sudo tcpdump -i ${active[0] ? active[0] : cmd("u ip -i", 0, 1)}`);
    return cmd("sudo nethogs -s");
  });
