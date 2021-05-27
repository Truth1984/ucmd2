const { h, cmd, u } = require("../head");
h.addEntry("screen", "start a screen command, use ctl+a+[ to enable scroll back mode", {
  "-n,--name": "name of the screen",
  "-c,--command": "command to run in screen",
  "-r,--reattach": "reattach",
  "-k,--kill": "kill target screen process",
  "-l,--list": "list of screen",
  "-u,--user": "define user, default to 'root'",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "c", kwargs: "command" },
    { args: "r", kwargs: "reattach" },
    { args: "k", kwargs: "kill" },
    { args: "l", kwargs: "list" },
    { args: "u", kwargs: "user" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let command = args.c;
    let name = args.n;
    let reattach = args.r;
    let kill = args.k;
    let list = args.l;
    let user = args.u ? args.u : "root";

    if (command) {
      command = u.arrayToString(command, " ");
      if (name) return cmd(`sudo -u ${user} screen -dmS ${name} ${command}`);
      return cmd(`sudo -u ${user} screen -dm bash -c ${command}`);
    }

    if (kill) return cmd(`sudo -u ${user} screen -X -S ${kill} quit`);
    if (reattach) return cmd(`sudo -u ${user} screen -r ${u.equal(reattach, []) ? "" : reattach}`);
    if (list) return cmd(`sudo -u ${user} ls -R /var/run/screen/`);
    if (name) return cmd(`sudo -u ${user} screen -r ${name}`);
  });
