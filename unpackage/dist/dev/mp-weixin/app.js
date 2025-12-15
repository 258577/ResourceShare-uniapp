"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/favorite/favorite.js";
  "./pages/my/my.js";
  "./pages/login/login.js";
  "./pages/resource/detail.js";
  "./pages/admin/banners/banners.js";
  "./pages/admin/upload/upload.js";
  "./pages/resource/tv.js";
  "./pages/resource/movie.js";
  "./pages/resource/software.js";
  "./pages/resource/book.js";
  "./pages/resource/shortvideo.js";
  "./pages/resource/anime.js";
  "./pages/resource/variety.js";
  "./pages/resource/usatv.js";
  "./pages/resource/comic.js";
  "./pages/resource/koreatv.js";
  "./pages/resource/music.js";
  "./pages/category/allCategories.js";
  "./pages/webview/webview.js";
  "./pages/search/search.js";
  "./pages/admin/recommend/recommend.js";
  "./pages/admin/edit/edit.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
