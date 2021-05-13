const u = require("awadau");

module.exports = class {
  constructor(entry, mainInfo = "", width = 20) {
    this.mainEntry = entry;
    this.lineWidth = width;
    this.mainInfo = mainInfo;
    this.entryInfo = {};
    this.argsInfo = {};
  }

  addEntry(name, description = "", argsMap = {}) {
    this.entryInfo[name] = description;
    this.argsInfo[name] = argsMap;
  }

  compile() {
    let result = { "--help": "" };
    let cLen = this.lineWidth;
    let getSpace = (str) => u.repeatValues(" ", cLen - u.len(str));
    result["--help"] += `${this.mainEntry}${getSpace(this.mainEntry)}[Command]\n${this.mainInfo}\n\nCommands:\n`;
    for (let [i, j] of u.mapEntries(this.entryInfo)) {
      result["--help"] += i + getSpace(i) + j + "\n";
      result[i] = `${this.mainEntry} ${i}\n${j}\n\nCommands:\n`;
      for (let [k, l] of u.mapEntries(this.argsInfo[i])) result[i] += k + getSpace(k) + l + "\n";
    }
    return result;
  }
};
