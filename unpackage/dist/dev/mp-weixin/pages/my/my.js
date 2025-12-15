"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "my",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    common_vendor.onShow(() => {
      getUserInfo();
    });
    const getUserInfo = () => {
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo) {
        userInfo.value = storedUserInfo;
      }
    };
    const goLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    const goToBannerManage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/banners/banners"
      });
    };
    const goToResourceManage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/upload/upload"
      });
    };
    const goToResourceEdit = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/edit/edit"
      });
    };
    const goToRecommendManage = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/recommend/recommend"
      });
    };
    const goToFavorites = () => {
      common_vendor.index.switchTab({
        url: "/pages/favorite/favorite"
      });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            userInfo.value = null;
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !userInfo.value
      }, !userInfo.value ? {
        b: common_assets._imports_0$1,
        c: common_vendor.o(goLogin)
      } : {
        d: userInfo.value.avatarUrl || "/static/avatar.png",
        e: common_vendor.t(userInfo.value.nickName || "用户"),
        f: common_vendor.t(userInfo.value.role === "admin" ? "管理员" : "普通用户")
      }, {
        g: userInfo.value && userInfo.value.role === "admin"
      }, userInfo.value && userInfo.value.role === "admin" ? {
        h: common_vendor.o(goToBannerManage),
        i: common_vendor.o(goToResourceManage),
        j: common_vendor.o(goToResourceEdit),
        k: common_vendor.o(goToRecommendManage)
      } : {}, {
        l: common_vendor.o(goToFavorites),
        m: userInfo.value
      }, userInfo.value ? {
        n: common_vendor.o(handleLogout)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
