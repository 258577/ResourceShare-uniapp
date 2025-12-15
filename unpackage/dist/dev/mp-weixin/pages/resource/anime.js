"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "anime",
  setup(__props) {
    const resourceType = common_vendor.ref("anime");
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["resource-type"]: resourceType.value,
          ["menu-items"]: []
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
