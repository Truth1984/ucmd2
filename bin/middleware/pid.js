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
    { args: "f", kwargs: "find" },
    { args: "s", kwargs: "system" },
    { args: "d", kwargs: "directory" },
    { args: "p", kwargs: "process" },
    { args: "N", kwargs: "port" },
    { args: "D", kwargs: "detail" },
    { args: "R", kwargs: "relation" },
    { args: "n", kwargs: "network" },
    { args: "A", kwargs: "all" },
    { args: "l", kwargs: "log" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let pid = args.p;
    let find = args.f;
    let system = args.s;
    let directory = args.d;
    let Process = args.p;
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
      let filtered = procList.filter(
        (item) => u.contains(item.COMMAND, find[0]) || u.contains(item["$REST$"], find[0])
      );
      console.log(filtered[0] && !u.contains(filtered[0]["$REST$"], ["pid", "-f", find[0]]) ? filtered[0].PID : -1);
    }

    if (system || all) dlog("systemctl", `sudo systemctl status ${pid}`);
    if (directory || all) dlog("starting directory", `sudo pwdx ${pid}`);
    if (Process || all) dlog("process info (grep)", `sudo ps -auxwwf | grep ${pid}`);
    if (detail || all) dlog("detailed info", `sudo lsof -p ${pid}`);
    if (port || all) dlog("network port (grep)", `sudo netstat -plntu | grep ${pid}/`);
    if (relation || all) dlog("process relationship", `sudo pstree -laps ${pid}`);
    if (network || all) dlog("established network connection (grep)", `sudo lsof -i | grep ${pid}`);
    if (log) return cmd(`sudo strace -p${pid} -f -t -e ${u.equal(log, []) ? "all" : log}`);
  });
