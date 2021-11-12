const { spawnSync } = require("child_process");

module.exports = (scripts, log, returnable = false, full = false) => {
  if (log || process.env.UDEBUG || process.env.udebug) console.log(scripts);
  let cmdarray = scripts.split(" ");
  return full
    ? spawnSync(cmdarray.shift(), cmdarray, {
        shell: true,
        stdio: "pipe",
        encoding: "utf-8",
        env: process.env,
      })
    : spawnSync(cmdarray.shift(), cmdarray, {
        shell: true,
        stdio: returnable ? "pipe" : "inherit",
        encoding: "utf-8",
        env: process.env,
      }).stdout;
};
