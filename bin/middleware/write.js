const { h, cmd, un } = require("../head");
h.addEntry("write", "write content to file, specify $0:filelocation, and $1:content", {
  "-c,--content": "content of the file",
  "-f,--file": "file location",
})
  .addLink({ _: 1, args: "c", kwargs: "content" }, { _: 0, args: "f", kwargs: "file" })
  .addAction((argv) => {
    let args = argv.args;
    let content = args.c;
    let file = args.f;

    let fpath = "/tmp/" + un.uuid();
    un.fileWriteSync(content[0], false, fpath);
    cmd(`sudo mv ${fpath} ${file[0]}`);
  });
