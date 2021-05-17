const { h, cmd, u } = require("../head");

h.addEntry("targz", "zip and unzip file", {
  "-z,--zip": "zip the file",
  "-u,--unzip": "unzip the file",
  "-d,--dest": "destination, default to 'compressed.tar' ",
})
  .addLink({ args: "z", kwargs: "zip" }, { args: "u", kwargs: "unzip" }, { args: "d", kwargs: "dest" })
  .addAction((argv) => {
    let args = argv.args;
    let zip = args.z;
    let dest = args.d ? args.d : "compressed.tar";
    let unzip = u.equal(args.u, []) ? dest : args.u;

    if (unzip) return cmd(`tar -xf ${unzip}`, true);
    if (zip) return cmd(`tar -cvz ${u.arrayToString(zip, " ")} -f ${dest}`, true);
    return cmd(`u targz --help`);
  });
