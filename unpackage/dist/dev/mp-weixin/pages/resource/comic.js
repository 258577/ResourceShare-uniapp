"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "comic",
  setup(__props) {
    const resourceType = common_vendor.ref("comic");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "古代", type: "ancient" },
      { name: "现代", type: "modern" },
      { name: "玄幻", type: "fantasy" }
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
