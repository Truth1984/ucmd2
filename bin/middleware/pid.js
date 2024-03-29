const { h, cmd, u, cu } = require("../head");

h.addEntry("pid", "find system information about the target id", {
  "[0],-p,--pid": "pid to work on",
  "-f,--find": "find pid, return first result, return -1 if not found, reduce grep noise",
  "-s,--system": "systemctl status about target",
  "-d,--directory": "directory of running process",
  "-P,--process": "process information",
  "-D,--detail": "details of directory or file system of target process",
  "-N,--port": "network port",
  "-R,--relation": "relationship to the process",
  "-n,--network": "network connection",
  "-l,--log": "log the pid details, type: read,write,open,close,%file,%process,%net,%network",
})
  .addLink(
    { _: 0, args: "p", kwargs: "pid" },
    { $: 0, args: "f", kwargs: "find" },
    { $: 0, args: "s", kwargs: "system" },
    { $: 0, args: "d", kwargs: "directory" },
    { $: 0, args: "P", kwargs: "process" },
    { $: 0, args: "N", kwargs: "port" },
    { $: 0, args: "D", kwargs: "detail" },
    { $: 0, args: "R", kwargs: "relation" },
    { $: 0, args: "n", kwargs: "network" },
    { $: 0, args: "A", kwargs: "all" },
    { $: 0, args: "l", kwargs: "log" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let pid = args.p;
    let find = args.f;
    let system = args.s;
    let directory = args.d;
    let processes = args.P;
    let detail = args.D;
    let port = args.N;
    let relation = args.R;
    let network = args.n;
    let all = args.A;
    let log = args.l;

    let dlog = (describe, line) => {
      console.log("-----", describe, "-----");
      return cmd(line);
    };

    if (find) {
      let procList = cu.shellParser(cmd("ps -aux", false, true), { REST: true });
      let filtered = procList.filter((item) => u.contains(item.COMMAND, pid[0]) || u.contains(item["$REST$"], pid[0]));
      console.log(filtered[0] && !u.contains(filtered[0]["$REST$"], ["pid", "-f", pid[0]]) ? filtered[0].PID : -1);
    }

    if (pid && u.stringCheckType(pid, "num")) dlog("basic info", `sudo ps -u -p ${pid}`);
    if (system || all) dlog("systemctl", `sudo systemctl status ${pid}`);
    if (directory || all) dlog("starting directory", `sudo pwdx ${pid}`);
    if (processes || all) dlog("process info (grep)", `sudo ps -auxwwf | grep ${pid}`);
    if (detail || all) dlog("detailed info", `sudo lsof -p ${pid}`);
    if (port || all) dlog("network port (grep)", `sudo netstat -plntu | grep ${pid}/`);
    if (relation || all) dlog("process relationship", `sudo pstree -laps ${pid}`);
    if (network || all) dlog("established network connection (grep)", `sudo lsof -i | grep ${pid}`);
    if (log) return cmd(`sudo strace -p${log[0] ? log[0] : pid} -f -t -e ${log[1] ? log[1] : "all"}`);
  });
