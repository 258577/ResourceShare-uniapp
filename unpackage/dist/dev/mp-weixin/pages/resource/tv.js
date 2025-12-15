"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "tv",
  setup(__props) {
    const resourceType = common_vendor.ref("tv");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "都市", type: "urban" },
      { name: "家庭", type: "family" },
      { name: "爱情", type: "romance" },
      { name: "古装", type: "historical" },
      { name: "玄幻", type: "fantasy" },
      { name: "悬疑", type: "suspense" }
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
