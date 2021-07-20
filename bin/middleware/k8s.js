const { h, cmd, u, cu } = require("../head");
h.addEntry("k8s", "k8s common operations", {
  "[0],-n,--name": "name to find or use",
  "[1],-r,--resource": "get resource info, resource type: kubectl api-resources",
  "-d,--describe": "describe resource info",
  "-c,--convert": "convert k8s.gcr.io url and save it to local image, $accessable:ver, $tag:ver",
})
  .addLink(
    { _: 0, args: "n", kwargs: "name" },
    { _: 1, args: "r", kwargs: "resource" },
    { args: "d", kwargs: "describe" },
    { args: "c", kwargs: "convert" }
  )
  .addAction(async (argv) => {
    let args = argv.args;
    let name = args.n;
    let resource = args.r;
    let describe = args.d;
    let convert = args.c;

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

    // senario:
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
      if (!pDescribe) return cmd(`kubectl get ${pResource} -A | grep ${pName}`);
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
        // normal
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

      let cResource = await cu.multiSelect(commonResourceList);
      if (cResource == "all") {
        for (let i of u.arrayExtract(commonResourceList, 1)) dlog(i, `kubectl get ${i} -A | grep ${pName}`);
        return;
      }

      let cResult = cu.shellParser(cmd(`kubectl get ${cResource} -A`, 0, 1));
      cResult = cResult.filter((item) => u.contains(item.NAME, pName));
      if (!(cResult && cResult[0] && cResult[0].NAME)) return console.log(cResult);

      let cWhole = await cu.multiSelect(cResult);
      let cName = cWhole.NAME;
      let cNameSpace = cWhole.NAMESPACE ? `-n ${cWhole.NAMESPACE}` : pDescribe ? "" : "-A";
      return cmd(`kubectl ${pDescribe ? "describe" : "get"} ${cResource} ${cName} ${cNameSpace}`);
    }

    if (pResource) {
      if (pDescribe) return cmd(`kubectl describe ${pResource}`);
      return cmd(`kubectl get ${pResource} -A`);
    }
  });
