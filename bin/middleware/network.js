const { h, cmd, u } = require("../head");

h.addEntry("network", "live network display", {
  "[0]": "display all the network connection",
  "-d,--device": "device for showing network details",
  "-t,--tcp": "tcp connection status",
  "-l,--list": "list web interfaces details",
})
  .addLink({ _: 0, args: "d", kwargs: "device" }, { args: "t", kwargs: "tcp" }, { args: "l", kwargs: "list" })
  .addAction((argv) => {
    let args = argv.args;
    let device = args.d;
    let tcp = args.t;
    let list = args.l;

    if (list) return cmd("sudo netstat -i");
    if (tcp) return cmd(`sudo tcpdump ${u.len(tcp) > 0 ? "-i " + tcp : tcp}`);
    if (device) return cmd("sudo nethogs " + device);
    return cmd("sudo nethogs -s");
  });
