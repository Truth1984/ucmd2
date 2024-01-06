const { h, cmd, u, un, cu } = require("../head");
const paths = require("path");
const reach = require("is-reachable");
const urls = require("url");

h.addEntry("deep", "deep logic operation", {
  "-d,--down,--download": "download url from youtube or m3u8 or mp4",
  "-P,--path,--downpath": "download path default set to /ss/down",
})
  .addLink(
    { args: "d", kwargs: "download" },
    { args: "d", kwargs: "down" },
    { args: "P", kwargs: "path" },
    { args: "P", kwargs: "downpath" }
  )
  .addAction(async (argv) => {
    let urlReachale = async (url) => reach(new urls.URL(u.url(url)).host);

    let dockerRun = (image, name, onceCmd, extraArg = "", useProxy) => {
      let args = "";
      if (name) args += `--name ${name} `;
      args += "-d --add-host=host.docker.internal:host-gateway";
      args += extraArg + " ";
      let px = process.env.HTTP_PROXY;
      if (useProxy) args += `-e HTTPS_PROXY=${px} -e HTTP_PROXY=${px} -e https_proxy=${px} -e http_proxy=${px}`;
      if (onceCmd) args += "--rm ";
      let entry = u.typeCheck(onceCmd, "str") ? onceCmd : "";
      let sentence = `docker run ${args} ${image} ${entry}`;
      return cmd(sentence, true);
    };

    let args = argv.args;
    let download = args.d;
    let downpath = args.P ? args.P : "/ss/down";

    if (download) {
      if (u.contains(download, ".m3u8")) {
        let name = u.stringReplace(paths.basename(download), { ".m3u8$": ".mp4" });
        let sname = name.replace(/[^\w\.]/gi, "");
        let dest = un.filePathNormalize(downpath, sname);
        let dname = "m3u8_" + sname;
        let reachable = await urlReachale(source);
        let ffmpegCmd = `-headers 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36' -fflags +genpts -y -i ${download} -c copy ${dest}`;
        return dockerRun("jrottenberg/ffmpeg:4-alpine", dname, ffmpegCmd, "", !reachable);
      } else if (u.contains(download, "youtube.com")) {
        let dockername = paths.basename(download).replace(/[^\w\.]/gi, "");
        let dname = "ytb_" + dockername;
        let destDir = un.filePathNormalize(downpath);
        let newname = `--output '/workdir/${dockername}.%(ext)s'`;
        let ytbdlCmd = `-f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' ${download} ${newname}`;
        return dockerRun("mikenye/youtube-dl", dname, ytbdlCmd, `-e PGID=0 -e PUID=0 -v ${destDir}:/workdir`, true);
      }
    }
  });
