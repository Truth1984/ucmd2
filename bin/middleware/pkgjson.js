const { h, un, u, cu } = require("../head");
h.addEntry("pkgjson", "node package.json modifier", {
  "-n,--name": "name of the script",
  "-a,--add": "add script or replace script",
  "-h,--has": "has this script ?",
  "-l,--list": "list all the commands",
})
  .addLink(
    { args: "n", kwargs: "name" },
    { args: "a", kwargs: "add" },
    { args: "h", kwargs: "has" },
    { args: "l", kwargs: "list" }
  )
  .addAction((argv) => {
    let args = argv.args;
    let name = args.n;
    let add = args.a;
    let has = args.h;
    let list = args.l;

    let path = "package.json";
    if (!un.fileExist(path)) path = "../package.json";
    if (!un.fileExist(path)) return cu.cmderr("package.json file does not exist", "pkgjson");

    let data = u.stringToJson(un.fileReadSync(path));
    if (has) return console.log(u.contains(data["scripts"], has));
    if (list) return console.log(data["scripts"]);
    if (!add) return console.log(data["scripts"][name[0]]);
    data["scripts"][name] = add[0];
    return un.fileWriteSync(u.jsonToString(data, "  "));
  });
