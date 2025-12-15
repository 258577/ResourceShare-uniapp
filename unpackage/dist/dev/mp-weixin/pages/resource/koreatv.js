"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "koreatv",
  setup(__props) {
    const resourceType = common_vendor.ref("koreatv");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "都市", type: "urban" },
      { name: "爱情", type: "romance" },
      { name: "悬疑", type: "suspense" },
      { name: "校园", type: "campus" },
      { name: "古装", type: "historical" },
      { name: "职场", type: "workplace" }
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
