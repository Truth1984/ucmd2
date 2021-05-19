const { h, cmd, u, cu, un } = require("../head");
h.addEntry("dc", "docker-compose command", {
  "-u,--up": "up, detached mode",
  "-d,--down": "down, and remove orphan",
  "-i,--images": "images display",
  "-b,--build": "build image",
  "-p,--process": "process list AKA containter",
  "-r,--stop": "stop container and remove corresponding volume",
  "-R,--restart": "restart the container",
  "-e,--execute": "execute bash command",
  "-L,--live": "live log",
  "-l,--log": "logs service",
})
  .addLink(
    { args: "u", kwargs: "up" },
    { args: "d", kwargs: "down" },
    { args: "i", kwargs: "images" },
    { args: "b", kwargs: "build" },
    { args: "p", kwargs: "process" },
    { args: "r", kwargs: "stop" },
    { args: "R", kwargs: "restart" },
    { args: "e", kwargs: "execute" },
    { args: "L", kwargs: "live" },
    { args: "l", kwargs: "log" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let up = args.u;
    let down = args.d;
    let images = args.i;
    let build = args.b;
    let processes = args.p;
    let stop = args.r;
    let restart = args.R;
    let execute = args.e;
    let live = args.L;
    let log = args.l;

    if (!un.fileExist("docker-compose.yml")) return cu.cmderr("docker-compose.yml doesn't exist", "dc");
    if (up) {
      if (!un.fileExist(".env")) cmd(`touch .env`);
      return cmd(`sudo docker-compose --env-file ".env" up -d`);
    }
    if (down) return cmd("sudo docker-compose down --remove-orphans");
    if (images) return cmd("sudo docker-compose images");
    if (build) return cmd("sudo docker-compose build --force-rm");
    if (stop) return cmd("sudo docker-compose rm -s");
    if (restart) return cmd("sudo docker-compose restart");
    if (processes) return cmd("sudo docker-compose ps -a");

    let key = cu.multiSelect(u.mapKeys(cu.yamlParser.load("docker-compose.yml").services));
    if (log) return cmd(`sudo docker-compose logs ${key} | tail -n500`);
    if (live) return cmd(`sudo docker-compose logs -f ${key}`);
    if (execute) {
      if (u.equal(execute, [])) execute = ["/bin/sh"];
      execute = u.arrayToString(execute, " ");
      return cmd(`sudo docker exec -it ${key} ${execute}`);
    }
  });
