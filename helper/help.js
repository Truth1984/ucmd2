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
   * @param {{_?:number, args?:string, kwargs?:string, $?:number}[]} listen _ for index position; bind _, args and kwargs together \
   * $: soft link, if target _ already had value taken, then pass
   *
   */
  addLink(...listen) {
    /**
     * @param {store} storage
     * three way bind
     */
    let sequence = (storage) => {
      let freshObj = { _: [], args: {}, kwargs: {} };

      /**
       * @param {"_" | "args" | "kwargs"} type
       */
      let assign = (type, typeTarget, value) => {
        if (typeTarget != undefined)
          u.arrayOfMapSearchStrict(listen, { [type]: typeTarget }).map((item) => {
            if (item._ != undefined) freshObj._[item._] = value;
            if (item.args != undefined) freshObj.args[item.args] = value;
            if (item.kwargs != undefined) freshObj.kwargs[item.kwargs] = value;

            if (item.$ != undefined && freshObj._[item.$] == undefined) assign("_", item.$, value);
          });
      };

      for (let i in storage._) assign("_", u.int(i), [storage._[i]]);
      for (let i in storage.args) assign("args", i, storage.args[i]);
      for (let i in storage.kwargs) assign("kwargs", i, storage.kwargs[i]);

      return freshObj;
    };

    this._holder.sequence = sequence;
    return this;
  }

  /**
   * @param {(storage:store)=>{}} action
   */
  addAction(action = () => {}) {
    let that = this._holder.sequence ? this._holder.sequence : (i) => i;
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
