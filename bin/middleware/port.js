const u = require("awadau");
// const cu = require("cmdline-util");
const os = require("os");
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
    let port = args.p;
    let docker = args.d;
    let connection = args.c;

    if (os.platform() == "win32") {
      if (!port) return cmd("netstat -bn");
      return cmd("netstat -bn | grep " + port);
    }

    if (docker) {
      if (u.equal(docker, [])) return cmd(`sudo docker ps --format "{{.Ports}}\t:\t{{.Image}}"`);
      else return cmd(`sudo docker ps | grep ${docker}`);
    }

    if (connection) return cmd(`sudo lsof -i :${connection}`);

    if (!port) return cmd("sudo netstat -plntu");
    return cmd("sudo netstat -lntup | grep " + port);
  });
