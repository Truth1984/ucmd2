const { h, cmd, u, cu } = require("../head");
h.addEntry("retry", "retry the command if failed", {
  "[0],-c,--command": "command",
  "-t,--times": "times to repeat, default to '3'",
  "-i,--interval": "interval to try in second, default to '2'",
})
  .addLink({ _: 0, args: "c", kwargs: "command" }, { args: "t", kwargs: "times" }, { args: "i", kwargs: "interval" })
  .addAction(async (argv) => {
    let args = argv.args;
    let command = args.c;
    let times = args.t ? args.t[0] : 3;
    let interval = args.i ? args.i[0] : 2;
    command = command[0];

    await u
      .promiseTryTimesInfo(
        (err, remain) => {
          if (err) console.log("retrying ...", u.dateFormat("plain"), remain + " times remain", command, "\n" + err);
          let result = cmd(command, false, true, true);
          if (result.status > 0) return Promise.reject(result.stderr.toString().trim());
          else return console.log(result.stdout.toString().trim());
        },
        times,
        interval
      )
      .catch(() => cu.cmderr("maximum retry reached", "retry"));
  });
