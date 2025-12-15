"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "software",
  setup(__props) {
    const resourceType = common_vendor.ref("software");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "办公", type: "office" },
      { name: "编程", type: "programming" },
      { name: "图像图形", type: "graphics" },
      { name: "建模", type: "modeling" },
      { name: "社交", type: "social" }
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
