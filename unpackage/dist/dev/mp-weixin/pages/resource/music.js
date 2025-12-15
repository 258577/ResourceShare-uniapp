"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "music",
  setup(__props) {
    const resourceType = common_vendor.ref("music");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "流行", type: "pop" },
      { name: "欧美", type: "western" },
      { name: "粤语", type: "cantonese" }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          ["resource-type"]: resourceType.value,
          ["menu-items"]: menuItems.value
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
