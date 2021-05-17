const os = require("os");
const u = require("awadau");
const { h, cmd } = require("../head");

h.addEntry("port", "scan for a specific port", {
  "-p,--port,--process": "port number or process name",
  "-d,--docker": "docker container port",
  "-c,--connection": "connection details for specific port",
})
  .addLink(
    { _: 0, args: "p", kwargs: "port" },
    { _: 0, args: "p", kwargs: "process" },
    { args: "d", kwargs: "docker" },
    { args: "c", kwargs: "connection" }
  )
  .addAction((argv) => {
    let args = argv.args;
    if (os.platform() == "win32") {
      if (!args.p) return cmd("netstat -bn");
      return cmd("netstat -bn | grep " + args.p[0]);
    }

    if (args.d) {
      if (u.equal(args.d, [])) return cmd(`sudo docker ps --format "{{.Ports}}\t:\t{{.Image}}"`);
      else return cmd(`sudo docker ps | grep  ${args.d[0]}`);
    }
    if (!args.p) return cmd("sudo netstat -plntu");
    return cmd("sudo netstat -lntup | grep " + args.p[0]);
  });
