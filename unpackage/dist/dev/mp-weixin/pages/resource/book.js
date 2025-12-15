"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "book",
  setup(__props) {
    const resourceType = common_vendor.ref("book");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "言情", type: "romance" },
      { name: "耽美", type: "bl" },
      { name: "玄幻", type: "fantasy" },
      { name: "武侠", type: "martial" },
      { name: "悬疑", type: "suspense" },
      { name: "科幻", type: "sci-fi" },
      { name: "历史", type: "historical" }
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
