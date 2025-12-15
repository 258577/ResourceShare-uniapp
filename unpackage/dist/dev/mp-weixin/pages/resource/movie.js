"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ResourceCommon();
}
const ResourceCommon = () => "../../components/ResourceCommon.js";
const _sfc_main = {
  __name: "movie",
  setup(__props) {
    const resourceType = common_vendor.ref("movie");
    const menuItems = common_vendor.ref([
      { name: "全部", type: "" },
      { name: "爱情", type: "romance" },
      { name: "喜剧", type: "comedy" },
      { name: "奇幻", type: "fantasy" },
      { name: "青春", type: "youth" },
      { name: "恐怖", type: "horror" },
      { name: "动画", type: "animation" },
      { name: "科幻", type: "sci-fi" },
      { name: "动作", type: "action" },
      { name: "战争", type: "war" }
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
