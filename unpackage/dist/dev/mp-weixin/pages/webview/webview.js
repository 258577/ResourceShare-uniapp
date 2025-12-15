"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "webview",
  setup(__props) {
    const url = common_vendor.ref("");
    const handleMessage = (event) => {
      console.log("WebView message:", event);
    };
    const handleCopyLink = () => {
      common_vendor.index.setClipboardData({
        data: url.value,
        success: () => {
          common_vendor.index.showToast({
            title: "链接已复制",
            icon: "success"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = ((_a = currentPage.$page) == null ? void 0 : _a.options) || currentPage.options;
      if (options && options.url) {
        url.value = decodeURIComponent(options.url);
      }
    });
    return (_ctx, _cache) => {
      return {
        a: url.value,
        b: common_vendor.o(handleMessage),
        c: common_vendor.o(handleCopyLink)
      };
    };
  }
};
wx.createPage(_sfc_main);
