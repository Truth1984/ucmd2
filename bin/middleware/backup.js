const { h, u, un, cu } = require("../head");
h.addEntry("backup", "backup a file to local backup folder", {
  "-f,--file": "file location",
  "-l,--list": "list current backed up file",
  "-r,--remove": "remove backed up file",
})
  .addLink({ _: 0, args: "f", kwargs: "file" }, { args: "l", kwargs: "list" }, { args: "r", kwargs: "remove" })
  .addAction((argv) => {
    let args = argv.args;
    let file = args.f;
    let list = args.l;
    let remove = args.r;

    let basePath = "~/.application/backup/";
    let recordsPath = un.filePathNormalize(basePath, ".readme.json");
    if (!un.fileExist(recordsPath)) un.fileWriteSync("{}", false, recordsPath);

    let backupJson = u.stringToJson(un.fileReadSync(recordsPath));
    if (list) return console.log(backupJson);

    if (remove) {
      console.log(backupJson);
      let target = u.mapKeys(backupJson);
      return cu.multiSelect(target).then((data) => {
        un.fileDelete(basePath + data);
        delete backupJson[data];
        return un.fileWriteSync(u.jsonToString(backupJson), false, recordsPath);
      });
    }

    if (!un.fileExist(file[0])) return cu.cmderr("unable to locate file", "backup");
    file = file[0];
    let fanalyze = un.filePathAnalyze(file);
    let uuid = un.uuid(false);
    let filename = un.filePathNormalize(uuid + fanalyze.basename);

    backupJson[filename] = {
      originName: file,
      date: u.dateFormat("locale24"),
      originFull: fanalyze.full.current,
      parentDir: fanalyze.full.dirname,
    };
    return cu
      .cmdfull(`cp ${file} ~/.application/backup/${filename}`)
      .then(() => un.fileWriteSync(u.jsonToString(backupJson), false, recordsPath))
      .catch((e) => console.log(e));
  });
