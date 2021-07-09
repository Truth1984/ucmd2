const { h, cmd, u } = require("../head");
h.addEntry("k8s", "k8s common operations", { "-c,--convert": "convert k8s.gcr.io url and save it to local image" })
  .addLink({ args: "c", kwargs: "convert" })
  .addAction((argv) => {
    let args = argv.args;
    let convert = args.c;

    if (convert) {
      let conv = (name, ver) =>
        cmd(
          `sudo docker pull k8smx/${name}:${ver} && sudo docker tag k8smx/${name}:${ver} k8s.gcr.io/${name}:${ver} && sudo docker rmi k8smx/${name}:${ver}`
        );

      let cver = "v1.21.2";

      conv("kube-apiserver", cver);
      conv("kube-controller-manager", cver);
      conv("kube-scheduler", cver);
      conv("kube-proxy", cver);
      conv("etcd", "3.4.9");
      conv("pause", "3.5");
    }
  });
