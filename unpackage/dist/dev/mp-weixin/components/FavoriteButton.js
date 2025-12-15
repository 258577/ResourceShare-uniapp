"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "FavoriteButton",
  props: {
    resourceId: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    cover: String,
    link: String
  },
  setup(__props) {
    const props = __props;
    const isFavorite = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const checkUserLogin = () => {
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo && storedUserInfo._id) {
        userInfo.value = storedUserInfo;
        return true;
      }
      console.log("用户未登录或信息不完整");
      return false;
    };
    const checkFavoriteStatus = async () => {
      if (!checkUserLogin()) {
        console.log("未登录，跳过收藏状态检查");
        return;
      }
      if (!userInfo.value || !userInfo.value._id) {
        console.error("用户信息不完整，无法检查收藏状态");
        return;
      }
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "favorites",
          data: {
            action: "check",
            data: {
              userId: userInfo.value._id,
              resourceId: props.resourceId
            }
          }
        });
        if (result.code === 200) {
          isFavorite.value = result.data;
        }
      } catch (e) {
        console.error("检查收藏状态失败", e);
      }
    };
    const toggleFavorite = async () => {
      if (!checkUserLogin()) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        common_vendor.index.navigateTo({
          url: "/pages/login/login?redirect=favorite&resourceId=" + props.resourceId,
          success: () => {
          },
          fail: (err) => {
            console.error("导航到登录页失败:", err);
          }
        });
        return;
      }
      if (!userInfo.value || !userInfo.value._id) {
        console.error("用户信息不完整");
        common_vendor.index.showToast({
          title: "用户信息不完整，请重新登录",
          icon: "none"
        });
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return;
      }
      try {
        const action = isFavorite.value ? "remove" : "add";
        if (action === "add") {
          const resourceCheck = await checkResourceExists(props.resourceId);
          if (!resourceCheck) {
            common_vendor.index.showToast({
              title: "该资源已不存在",
              icon: "none"
            });
            return;
          }
        }
        let requestData = {
          userId: userInfo.value._id,
          resourceId: props.resourceId
        };
        if (action === "add") {
          requestData = {
            ...requestData,
            title: props.title || "",
            description: props.description || "",
            cover: props.cover || "",
            link: props.link || ""
          };
        }
        if (!requestData.userId) {
          throw new Error("用户ID不能为空");
        }
        if (!requestData.resourceId) {
          throw new Error("资源ID不能为空");
        }
        const { result } = await common_vendor.Vs.callFunction({
          name: "favorites",
          data: {
            action,
            data: requestData
          }
        });
        if (result.code === 200) {
          isFavorite.value = !isFavorite.value;
          common_vendor.index.showToast({
            title: isFavorite.value ? "收藏成功" : "已取消收藏",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.message || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("收藏操作异常:", e);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const checkResourceExists = async (resourceId) => {
      if (!resourceId)
        return false;
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "detail",
            data: { id: resourceId }
          }
        });
        return result.code === 200 && result.data;
      } catch (e) {
        console.error("检查资源是否存在失败:", e);
        return false;
      }
    };
    common_vendor.watch(
      () => props.resourceId,
      (newVal) => {
        if (newVal) {
          checkFavoriteStatus();
        }
      }
    );
    common_vendor.onMounted(() => {
      checkFavoriteStatus();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.n(isFavorite.value ? "icon-star-filled" : "icon-star"),
        b: common_vendor.t(isFavorite.value ? "已收藏" : "收藏"),
        c: common_vendor.o(toggleFavorite)
      };
    };
  }
};
wx.createComponent(_sfc_main);
