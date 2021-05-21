const u = require("awadau");
module.exports = (name, main, ...argsMap) => {
  let kvmap = {};

  for (let i of argsMap) for (let [j, k] of u.mapEntries(i)) kvmap[`-${j},--${u.refind(k, /\w+/)}`] = k;

  let linkstr = "";
  let letstr = "";

  for (let i of argsMap)
    for (let [j, k] of u.mapEntries(i)) {
      linkstr += `{args:"${j}",kwargs:"${u.refind(k, /\w+/).toLowerCase()}"},`;
      letstr += `let ${u.refind(k, /\w+/).toLowerCase()} = args.${j};`;
    }

  console.log(
    `const { h, cmd, u } = require("../head");`,
    `h.addEntry("${name}", "${main}",`,
    kvmap,
    ").addLink(",
    linkstr,
    ").addAction((argv)=>{let args = argv.args;",
    letstr,
    "})"
  );
};
