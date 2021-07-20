const { h, cmd, u, cu } = require("../head");
h.addEntry("k8s", "k8s common operations", {
  "[0],-n,--name": "name to find or use",
  "[1],-r,--resource": "get resource info, resource type: kubectl api-resources",
  "-d,--describe": "describe resource info",
  "-c,--convert": "convert k8s.gcr.io url and save it to local image, $accessable:ver, $tag:ver",
  "-l,--log": "log target pot information, as $name, $line=100",
  "-L,--loglive": "live log target pot as $name",
  "-i,--image": "get images and target pod",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "r", kwargs: "resource" },
    { args: "d", kwargs: "describe" },
    { args: "c", kwargs: "convert" },
    { args: "l", kwargs: "log" },
    { args: "L", kwargs: "loglive" },
    { args: "i", kwargs: "image" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let name = args.n;
    let resource = args.r;
    let describe = args.d;
    let convert = args.c;
    let log = args.l;
    let loglive = args.L;
    let image = args.i;

    let dlog = (describe, line, grep) => {
      console.log("-----", describe, "-----");
      if (u.len(grep) > 0) line += ` | grep ${grep}`;
      return cmd(line);
    };

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

      if (convert[0] && convert[1])
        return cmd(
          `sudo docker pull ${convert[0]} && sudo docker tag ${convert[0]} ${convert[1]} && sudo docker rmi ${convert[0]}`,
          1
        );
      return;
    }

    // scenario:
    // name + resource | get
    // name + resource | describe
    // name | get | select:resource
    // name | describe | select:resource
    // resource | get
    // resource | describe

    let nameResourceArr = u.arrayAdd(name, resource, describe);
    let pDescribe = !!describe;
    let pName = nameResourceArr[0];
    let pResource = nameResourceArr[1];

    let resourceGetter = (rcs) => cu.shellParser(cmd(`kubectl get ${rcs} -A`, 0, 1));
    let nameWResourceGetter = (rcs, name) => resourceGetter(rcs).filter((item) => u.contains(item.NAME, name)); // may contain NAMESPACE

    if (pName && pResource) {
      if (!pDescribe) return cmd(`kubectl get ${pResource} -A  -o wide | grep ${pName}`);
      let pList = nameWResourceGetter(pResource, pName);
      let pTarget = {};
      if (u.len(pList) > 1) pTarget = await cu.multiSelect(u.arrayAdd("all", pList));
      else pTarget = pList[0];

      if (pTarget == "all") {
        for (let i of pList)
          dlog(
            i.NAME + i.NAMESPACE ? " " + i.NAMESPACE : "",
            `kubectl describe ${pResource} ${i.NAME} ${i.NAMESPACE ? "-n " + i.NAMESPACE : ""}`
          );
      } else {
        dlog(
          pTarget.NAME + pTarget.NAMESPACE ? " " + pTarget.NAMESPACE : "",
          `kubectl describe ${pResource} ${pTarget.NAME} ${pTarget.NAMESPACE ? "-n " + pTarget.NAMESPACE : ""}`
        );
      }
      return;
    }

    if (pName) {
      let commonResourceList = [
        "all",
        // common
        "po",
        "deploy",
        "no",
        "svc",
        "ing",
        "pvc",
        "pv",
        "ep",
        "ns",
        "sa",
        "ds",
        "sts",
        "netpol",
      ];

      if (pName == "all") return cmd(`kubectl get all -A -o wide`);

      let cResource = await cu.multiSelect(commonResourceList);
      if (cResource == "all") return cmd(`kubectl get all -A -o wide | grep ${pName}`);

      let cResult = cu.shellParser(cmd(`kubectl get ${cResource} -A -o wide`, 0, 1));
      cResult = cResult.filter((item) => u.contains(item.NAME, pName));
      if (!(cResult && cResult[0] && cResult[0].NAME)) return console.log(cResult);

      let cWhole = await cu.multiSelect(cResult);
      let cName = cWhole.NAME;
      let cNameSpace = cWhole.NAMESPACE ? `-n ${cWhole.NAMESPACE}` : "";
      if (pDescribe) return cmd(`kubectl describe ${cResource} ${cName} ${cNameSpace}`);
      return cmd(`kubectl get ${cResource} ${cName} ${cNameSpace ? cNameSpace : "-A"} -o wide`);
    }

    if (pResource) {
      if (pDescribe) return cmd(`kubectl describe ${pResource}`);
      return cmd(`kubectl get ${pResource} -A -o wide`);
    }

    if (log || loglive) {
      let target = log ? log : loglive;
      let podName = target[0];
      let podLine = target[1] ? target[1] : 100;
      let podWhole = await cu.multiSelect(nameWResourceGetter("po", podName));
      return cmd(
        `kubectl logs ${podWhole.NAME} -n ${podWhole.NAMESPACE} --tail ${podLine} ${loglive ? "--follow" : ""}`
      );
    }

    if (image)
      return cmd(
        `kubectl get pods -o='custom-columns=PODS:.metadata.name,Images:.spec.containers[*].image' -A ${
          u.len(image) > 0 ? "| grep " + image : ""
        }`
      );
  });
