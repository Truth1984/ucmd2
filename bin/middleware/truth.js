const { h, cmd, u, cu } = require("../head");
h.addEntry("truth", "single source of truth", {
  "-c,--cat": "cat the file",
  "-e,--edit": "edit the file",
  "-a,--add": "add config",
  "-g,--get": "get config by key",
})
  .addLink(
    { args: "c", kwargs: "cat" },
    { args: "e", kwargs: "edit" },
    { args: "a", kwargs: "add" },
    { args: "g", kwargs: "get" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let cat = args.c;
    let edit = args.e;
    let add = args.a;
    let get = args.g;

    let fpath = "/etc/ucmd2/config.json";

    cmd(`if ! [ -f ${fpath} ]; then sudo mkdir -p $(dirname ${fpath}) && sudo bash -c 'echo "{}" > ${fpath}'; fi;`);

    if (cat) return cmd(`sudo cat ${fpath}`);
    if (edit) return cmd(`sudo nano ${fpath}`);
    let fcontent = cu.jsonParser(cmd(`sudo cat ${fpath}`, 0, 1));
    if (add) {
      fcontent = u.mapMerge(fcontent, cu.jsonParser(add[0]));
      return cmd(`sudo bash -c 'echo ${u.jsonToString(fcontent, "")} > ${fpath}'`);
    }
    if (get) {
      return console.log(fcontent[get[0]]);
    }
  });
