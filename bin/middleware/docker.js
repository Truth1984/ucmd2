const { h, cmd, u, cu } = require("../head");

h.addEntry("docker", "docker additional command", {
  "[0],-t,--target": "target to manipulate",
  "-b,--build": "build dockerfile with result name, as [$targetName:version,$sourcefile]",
  "-s,--stop": "stop the container",
  "-S,--start": "start the container",

  "-r,--remove": "remove container",
  "-R,--removefull": "remove container and its volume",
  "-z,--restart": "restart docker container",
  "-e,--run": "run or execute with sh",
  "-E,--execute": "execute directly with sh,$or target",
  "-c,--clean": "clean <none> images",
  "-T,--transfer": "transfer file with save or load, can be $i:ver or i_ver.tar, better define ver",

  "-o,--overview": "overview full docker status",
  "-n,--network": "network status",
  "-v,--volume": "volume listing",
  "-f,--logpath": "logs file path of container",
  "-l,--log": "log docker process",
  "-L,--live": "live log",
  "-i,--images": "images display",
  "-p,--process": "process list AKA containter",
  "-P,--pid": "find process related pid",
})
  .addLink(
    { _: 0, args: "t", kwargs: "target" },
    { args: "b", kwargs: "build" },
    { $: 0, args: "s", kwargs: "stop" },
    { $: 0, args: "S", kwargs: "start" },

    { $: 0, args: "r", kwargs: "remove" },
    { $: 0, args: "R", kwargs: "removefull" },
    { $: 0, args: "z", kwargs: "restart" },
    { $: 0, args: "e", kwargs: "run" },
    { $: 0, args: "E", kwargs: "execute" },
    { args: "c", kwargs: "clean" },
    { $: 0, args: "T", kwargs: "transfer" },

    { args: "o", kwargs: "overview" },
    { args: "n", kwargs: "network" },
    { args: "v", kwargs: "volume" },
    { $: 0, args: "f", kwargs: "logpath" },
    { $: 0, args: "l", kwargs: "log" },
    { $: 0, args: "L", kwargs: "live" },
    { args: "i", kwargs: "images" },
    { args: "p", kwargs: "process" },
    { args: "P", kwargs: "pid" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let target = args.t;

    let build = args.b;
    let stop = args.s;
    let start = args.S;

    let remove = args.r;
    let removefull = args.R;
    let restart = args.z;
    let run = args.e;
    let execute = args.E;
    let clean = args.c;
    let transfer = args.T;

    let overview = args.o;
    let network = args.n;
    let volume = args.v;
    let logpath = args.f;
    let log = args.l;
    let live = args.L;
    let images = args.i;
    let processes = args.p;
    let pid = args.P;

    let dockerps = () =>
      cu.shellParser(cmd("sudo docker ps -a", 0, 1), {
        skipHead: 1,
        selfProvideHeader: ["CONTAINER ID", "IMAGE", "COMMAND", "CREATED", "STATUS", "PORTS", "NAMES"],
        separator: /\s{2,80}/,
      });

    let dockerimg = () =>
      cu.shellParser(cmd("docker images -a", 0, 1), {
        skipHead: 1,
        selfProvideHeader: ["REPOSITORY", "TAG", "IMAGE ID", "CREATED", "SIZE"],
        separator: /\s{2,80}/,
      });

    let dlog = (describe, line, grep) => {
      console.log("-----", describe, "-----");
      if (u.len(grep) > 0) line += ` | grep ${grep}`;
      return cmd(line);
    };

    let fuzzy = (name, ps = false, img = false) => {
      if (name == undefined) return cu.cmderr("target name undefined", "docker fuzzy");
      let list = [];
      if (ps)
        for (let i of dockerps())
          if (u.mapValues(i).some((v) => u.contains(v, name))) list.push(u.mapMerge(i, { id: i["CONTAINER ID"] }));
      if (img)
        for (let i of dockerimg())
          if (i["REPOSITORY"] != "<none>" && u.mapValues(i).some((v) => u.contains(v, name)))
            list.push(u.mapMerge(i, { id: i["IMAGE ID"] }));
      return cu.multiSelect(list);
    };

    if (build) {
      if (u.equal(build, [])) return cu.cmderr("targetimage not specified", "docker build");
      let sentence = "sudo docker image build ";
      if (u.contains(build[0], ":"))
        sentence += `-t ${build[0]} -t ${u.stringReplace(build[0], { ":.+": "" })}:latest `;
      else sentence += `-t ${build[0]}:latest `;

      if (build[1]) sentence += "-f " + build[1] + " ";
      sentence += ". ";
      return cmd(sentence);
    }

    if (target) {
      target = target[0];
      if (transfer) {
        if (u.contains(transfer, ".tar")) return cmd(`sudo docker load < ${transfer}`);
        if (u.contains(transfer, ":")) {
          let ver = u.refind(transfer, u.regexBetweenOut(":", "$"));
          let rname = u.refind(transfer, u.regexBetweenOut("^", ":"));
          if (u.contains(rname, "/")) rname = u.refind(rname, u.regexBetweenOut("/", "$"));
          return cmd(`sudo docker save -o ${rname}_ver_${ver}.tar ${transfer}`);
        } else {
          return cmd(`sudo docker save -o ${transfer}.tar ${transfer}`);
        }
      }

      if (stop) return cmd(`sudo docker container stop ` + (await fuzzy(target, true)).id);
      if (start) return cmd(`sudo docker container start ` + (await fuzzy(target, true)).id);
      if (restart) return cmd(`sudo docker container restart ` + (await fuzzy(target, true)).id);
      if (execute) {
        if (u.equal(execute, [])) execute = ["/bin/sh"];
        execute = u.arrayToString(execute, " ");
        return cmd(`sudo docker exec -it ${(await fuzzy(target, true)).id} ${execute}`);
      }

      if (run) {
        if (!run[1]) run = [target, "/bin/bash"];
        let rid = (await fuzzy(target, true, true)).id;
        if (!rid) rid = target;
        let status = cmd(`sudo docker ps | grep -q ${rid}`, 0, 1, 1).status;
        if (!status) run[0] = rid;
        return cmd(`sudo docker ${status ? "run" : "exec"} -it ${run[0]} ${run[1]}`);
      }

      if (remove) {
        let rid = (await fuzzy(target, true)).id;
        return cmd(`sudo docker container stop ${rid} && sudo docker container rm ${rid}`);
      }
      if (removefull) {
        let rid = (await fuzzy(target, true)).id;
        cmd(`sudo docker container stop ${rid} && sudo docker container rm ${rid}`);
        let inspects = cu.jsonParser(cmd(`sudo docker inspect ${rid}`, false, true));
        let mounts = inspects[0]["Mounts"];
        let qs = (volume) =>
          cu.cmdsq("remove volume" + volume + " (N)").then((result) => {
            if (result && result.toLowerCase() == "y") cmd(`sudo rm -rf ${volume}`);
          });
        if (mounts != undefined) for (let i of mounts) await qs(i["Source"]);
      }
      if (log) return cmd(`sudo docker logs ` + (await fuzzy(target, true)).id + " | tail -n500");
      if (live) return cmd(`sudo docker logs -f ` + (await fuzzy(target, true)).id);
      if (logpath) return cmd(`sudo docker inspect --format={{.LogPath}} ` + (await fuzzy(target, true)).id);
      if (pid) return cmd(`sudo docker top ` + (await fuzzy(target, true, true)).id);

      return cmd(`sudo docker inspect ${(await fuzzy(target, 1, 1)).id}`);
    }

    if (clean) cmd("sudo docker system prune --volumes");
    if (volume || overview) dlog("volume", "sudo docker volume ls", volume);
    if (processes || overview) dlog("process", "sudo docker ps -a", processes);
    if (images || overview) dlog("image", "sudo docker images -a", images);
    if (network || overview) dlog("network", "sudo docker network ls", network);
    if (overview) dlog("info", "sudo docker info");
  });
