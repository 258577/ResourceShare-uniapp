"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const isWechatLogin = common_vendor.ref(true);
    const adminForm = common_vendor.ref({
      username: "",
      password: ""
    });
    const redirect = common_vendor.ref("");
    const resourceId = common_vendor.ref("");
    common_vendor.onMounted(() => {
      const query = common_vendor.index.getEnterOptionsSync().query;
      if (query) {
        redirect.value = query.redirect || "";
        resourceId.value = query.resourceId || "";
      }
    });
    const navigateAfterLogin = () => {
      if (redirect.value === "favorite" && resourceId.value) {
        common_vendor.index.navigateTo({
          url: `/pages/resource/detail?id=${resourceId.value}`
        });
      } else {
        common_vendor.index.switchTab({
          url: "/pages/my/my"
        });
      }
    };
    const switchLoginType = () => {
      isWechatLogin.value = !isWechatLogin.value;
    };
    const handleAdminLogin = () => {
      if (adminForm.value.username === "admin" && adminForm.value.password === "admin") {
        common_vendor.index.setStorageSync("userInfo", {
          _id: "admin_" + Date.now(),
          // 添加一个唯一ID
          role: "admin",
          username: "admin"
        });
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          navigateAfterLogin();
        }, 1500);
      } else {
        common_vendor.index.showToast({
          title: "账号或密码错误",
          icon: "none"
        });
      }
    };
    const handleWechatLogin = () => {
      const mockUserInfo = {
        _id: "user_" + Date.now(),
        // 添加唯一ID
        nickname: "用户" + Math.floor(Math.random() * 1e3),
        avatarUrl: "",
        role: "user"
      };
      common_vendor.index.setStorageSync("userInfo", mockUserInfo);
      common_vendor.index.showToast({
        title: "登录成功",
        icon: "success"
      });
      setTimeout(() => {
        navigateAfterLogin();
      }, 1500);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !isWechatLogin.value
      }, !isWechatLogin.value ? {
        b: adminForm.value.username,
        c: common_vendor.o(($event) => adminForm.value.username = $event.detail.value),
        d: adminForm.value.password,
        e: common_vendor.o(($event) => adminForm.value.password = $event.detail.value),
        f: common_vendor.o(handleAdminLogin)
      } : {}, {
        g: common_vendor.o(handleWechatLogin),
        h: common_vendor.t(isWechatLogin.value ? "管理员登录" : "微信登录"),
        i: common_vendor.o(switchLoginType)
      });
    };
  }
};
wx.createPage(_sfc_main);
