const { h, cmd, u, cu, un } = require("../head");
h.addEntry("dc", "docker compose command", {
  "-u,--up": "up, detached mode",
  "-d,--down": "down, and remove orphan",
  "-D,--debug": "up, debug mode",
  "-i,--images": "images display",
  "-b,--build": "build image",
  "-p,--process": "process list AKA containter",
  "-r,--stop": "stop container and remove corresponding volume",
  "-k,--kill": "kill process by force",
  "-R,--restart": "restart the container",
  "-e,--execute": "execute bash command",
  "-L,--live": "live log",
  "-l,--log": "logs service",
})
  .addLink(
    { args: "u", kwargs: "up" },
    { args: "d", kwargs: "down" },
    { args: "D", kwargs: "debug" },
    { args: "i", kwargs: "images" },
    { args: "b", kwargs: "build" },
    { args: "p", kwargs: "process" },
    { args: "r", kwargs: "stop" },
    { args: "k", kwargs: "kill" },
    { args: "R", kwargs: "restart" },
    { args: "e", kwargs: "execute" },
    { args: "L", kwargs: "live" },
    { args: "l", kwargs: "log" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let up = args.u;
    let down = args.d;
    let debug = args.D;
    let images = args.i;
    let build = args.b;
    let processes = args.p;
    let stop = args.r;
    let kill = args.k;
    let restart = args.R;
    let execute = args.e;
    let live = args.L;
    let log = args.l;

    if (!un.fileExist("docker compose.yml")) return cu.cmderr("docker compose.yml doesn't exist", "dc");
    if (up || debug) {
      if (!un.fileExist(".env")) cmd(`touch .env`);
      let line = debug ? "--log-level DEBUG" : "";
      return cmd(`sudo CPWD=$PWD docker compose ${line} --env-file .env up -d`);
    }
    if (down) return cmd("sudo docker compose down --remove-orphans");
    if (images) return cmd("sudo docker compose images");
    if (build) return cmd("sudo docker compose build --force-rm");
    if (stop) return cmd("sudo docker compose rm -s");
    if (restart) return cmd("sudo docker compose restart");
    if (processes) return cmd("sudo docker compose ps -a");

    if (kill) {
      let pkey = u.stringToArray(cmd("sudo docker compose ps -q", undefined, true).trim(), "\n");
      let pkeyPid = pkey.map((i) => cmd(`sudo docker inspect -f '{{.State.Pid}}' ${i}`, undefined, true).trim());
      for (let i of pkeyPid) cmd(`kill -9 ${i}`);
      return console.log(pkeyPid);
    }

    let key = await cu.multiSelect(u.mapKeys(cu.yamlParser(un.fileReadSync("docker compose.yml")).services));
    if (log) return cmd(`sudo docker compose logs ${key} | tail -n500`);
    if (live) return cmd(`sudo docker compose logs -f --tail 500 ${key}`);
    if (execute) {
      if (u.equal(execute, [])) execute = ["/bin/sh"];
      execute = u.arrayToString(execute, " ");
      return cmd(`sudo docker compose exec --privileged ${key} ${execute}`);
    }
  });
