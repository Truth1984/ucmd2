const { h, cmd, u, un, cu } = require("../head");

h.addEntry("download", "download file from internet", {
  "[0],-u,--url": "url or m3u8 file",
  "[1],-f,--file": "filename or location to put in",
  "-a,--absolute": "put the file in current folder, else it will be under ~/Downloads",
  "-w,--wget": "download the file using wget",
})
  .addLink(
    { _: 0, args: "u", kwargs: "url" },
    { _: 1, args: "f", kwargs: "file" },
    { args: "a", kwargs: "absolute" },
    { args: "w", kwargs: "wget" }
  )
  .addAction((argv) => {
    const ffmpeg = require("fluent-ffmpeg");
    const fs = require("fs");
    const fsp = fs.promises;

    let _intervalLog = (path) =>
      setInterval(
        () =>
          fsp
            .stat(path)
            .then((data) => u.int(data.size) * 1e-6 + "MB")
            .then((data) => console.log(path, "fileSize: ", data))
            .catch((e) => console.log("error", e)),
        1000 * 30
      );

    let m3u8 = (urlOrFile, path) => {
      let interval = _intervalLog(path);

      return new Promise((resolve, reject) => {
        ffmpeg(urlOrFile)
          .on("error", (error) => {
            reject(urlOrFile + "\n" + error.stack);
          })
          .on("end", () => {
            resolve("download complete");
          })
          .outputOptions("-c copy")
          .outputOptions("-bsf:a aac_adtstoasc")
          .output(path)
          .run();
      })
        .then((data) => {
          clearInterval(interval);
          return data;
        })
        .catch((e) => {
          clearInterval(interval);
          return Promise.reject(e);
        });
    };

    let downloadFile = (url, path) => {
      let interval = _intervalLog(path);
      return un
        .fileDownload(url, path)
        .then(() => clearInterval(interval))
        .catch((e) => {
          clearInterval(interval);
          return cu.cmderr(e, "download", 1);
        });
    };

    let args = argv.args;
    let url = args.u[0];
    let filename = args.f ? args.f[0] : un.filePathNormalize(url.substring(url.lastIndexOf("/")));
    let absolute = args.a;
    let wget = args.w;

    if (!absolute) filename = un.filePathNormalize(process.env.HOME, "/Downloads/", filename);
    if (wget) return cmd(`sudo wget -o ${filename} ${url}`);

    if (/\.m3u8$/.test(url)) {
      if (!/\.mp4/.test(filename)) filename = filename + ".mp4";
      m3u8(url, filename);
    } else {
      downloadFile(url, filename);
    }
  });
