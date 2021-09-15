const { h, cmd, u, cu } = require("../head");
h.addEntry("process", "show list of current process", {
  "[0],-n,--name": "name to grep",
  "-f,--full": "full command display",
  "-s,--sortcpu": "sorted ps command by cpu first, set size, default to '10' ",
  "-S,--sortmem": "sorted ps command by memory first, set size, default to '10'",
  "-l,--log": "Log output with strace, using PID",
  "-K,--kill": "kill relevant process",
  "-d,--directory": "directory of running process, require pid",
  "-D,--detailed": "detailed directory or file system of target process, require pid",
  "-c,--container,--docker": "docker container stats",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { args: "f", kwargs: "full" },
    { args: "s", kwargs: "sortcpu" },
    { args: "S", kwargs: "sortmem" },
    { args: "l", kwargs: "log" },
    { args: "K", kwargs: "kill" },
    { args: "d", kwargs: "directory" },
    { args: "D", kwargs: "detailed" },
    { args: "c", kwargs: "container" },
    { args: "c", kwargs: "docker" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let full = args.f;
    let sortcpu = args.s;
    let sortmem = args.S;
    let log = args.l;
    let kill = args.K;
    let directory = args.d;
    let detailed = args.D;
    let docker = args.c;

    let base = "ps -aux";
    if (full) base += "wwf";
    if (name) return cmd(base + " | grep " + name);
    if (sortcpu) return cmd(`ps auxk -%cpu,%mem | head -n${u.equal(sortcpu, []) ? 10 : sortcpu}`);
    if (sortmem) return cmd(`ps auxk -%mem,%cpu | head -n${u.equal(sortmem, []) ? 10 : sortmem}`);
    if (log) return cmd(`sudo strace -p${log} -s9999 -e write`);
    if (kill) {
      let result = cmd(`ps -ae | { head -1; grep ${kill}; }`, false, true);
      return cu.shellParser(result).map((item) => cmd(`kill ${item.PID}`));
    }
    if (directory) return cmd(`sudo pwdx ${directory}`);
    if (detailed) return cmd(`sudo lsof -p ${detailed}`);
    if (docker) return cmd(`sudo docker stats --all`);
    return cmd(base);
  });
