const u = require("awadau");

module.exports = class {
  constructor(entry, mainInfo = "", width = 20) {
    this.mainEntry = entry;
    this.lineWidth = width;
    this.mainInfo = mainInfo;
    this.entryInfo = {};
    this.argsInfo = {};
    this.perform = {};
  }

  addEntry(name, description = "", argsMap = {}) {
    this.entryInfo[name] = description;
    this.argsInfo[name] = argsMap;

    this._holder = { name };
    return this;
  }

  /**
   * @typedef {{origin:{argv:{}},argv:{},entry?:string, _?:{}, args?:{}, kwargs?:{}}} store
   * @param {{_?:int, args?:string, kwargs?:string}[]} listen _ for index position; bind _, args and kwargs together
   *
   */
  addLink(...listen) {
    /**
     * @param {store} storage
     * three way bind
     */
    let sequence = (storage) => {
      let freshObj = { _: [], args: {}, kwargs: {} };
      for (let i in storage._) {
        freshObj._[i] = storage._[i];
        u.arrayOfMapSearch(listen, { _: i }).map((item) => {
          if (item.args != undefined) freshObj.args[item.args] = [storage._[i]];
          if (item.kwargs != undefined) freshObj.kwargs[item.kwargs] = [storage._[i]];
        });
      }

      for (let i in storage.args) {
        freshObj.args[i] = storage.args[i];
        u.arrayOfMapSearch(listen, { args: i }).map((item) => {
          if (item._ != undefined) freshObj._[item._] = storage.args[i];
          if (item.kwargs != undefined) freshObj.kwargs[item.kwargs] = storage.args[i];
        });
      }

      for (let i in storage.kwargs) {
        freshObj.kwargs[i] = storage.kwargs[i];
        u.arrayOfMapSearch(listen, { kwargs: i }).map((item) => {
          if (item._ != undefined) freshObj._[item._] = storage.kwargs[i];
          if (item.args != undefined) freshObj.args[item.args] = storage.kwargs[i];
        });
      }

      return freshObj;
    };
    this._holder.sequence = sequence;
    return this;
  }

  /**
   * @param {(storage:store)=>{}} action
   */
  addAction(action = () => {}) {
    let that = this._holder.sequence;
    this.perform[this._holder.name] = (storage) => action(u.mapMerge(storage, that(storage)));
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

  compileExecute() {
    return this.perform;
  }
};
