const { h, cmd, cu } = require("../head");

h.addEntry("scan", "probe target machine", {
  "[0],-i,--ip": "ip to probe",
  "[1],-p,--port": "port to probe",
  "-A,--all": "probe all ports",
})
  .addLink({ _: 0, args: "i", kwargs: "ip" }, { _: 1, args: "p", kwargs: "port" }, { args: "A", kwargs: "all" })
  .addAction((argv) => {
    let args = argv.args;
    let ip = args.i;
    let port = args.p;
    let all = args.A;

    if (all) return cmd(`nmap -Pn- ${ip}`);
    if (port)
      return cu
        .cmdfull(`nc -z ${ip} ${port}`)
        .then(() => true)
        .catch(() => false)
        .then(console.log);
    return cmd(`nmap -p- ${ip}`);
  });
