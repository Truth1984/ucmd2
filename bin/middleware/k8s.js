const { h, cmd, u } = require("../head");
h.addEntry(
  "k8s",
  "k8s common operations",
  { "-c,--convert": "convert k8s.gcr.io url and save it to local image" },
  { "-p,--pod": "display pod lists with namespace" }
)
  .addLink({ args: "c", kwargs: "convert" }, { $: 0, args: "p", kwargs: "pod" })
  .addAction((argv) => {
    let args = argv.args;
    let convert = args.c;
    let pod = args.p;

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
      conv("etcd", "3.4.13-0");
      conv("pause", "3.4.1");
      // coredns should not be used on master node
      cmd(
        `sudo docker pull coredns/coredns:1.8.0 && sudo docker tag coredns/coredns:1.8.0 k8s.gcr.io/coredns/coredns:v1.8.0 && sudo docker rmi coredns/coredns:1.8.0`
      );
    }

    if (pod) return cmd(`sudo kubectl get po ${u.equal(pod, []) ? "-A" : pod[0]}`);
  });
