"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "recommend",
  setup(__props) {
    const resourceList = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const categories = [
      { name: "电视剧", type: "tv" },
      { name: "电影", type: "movie" },
      { name: "软件", type: "software" },
      { name: "小说", type: "book" },
      { name: "短剧", type: "shortvideo" },
      { name: "动漫", type: "anime" },
      { name: "综艺", type: "variety" },
      { name: "美剧", type: "usatv" },
      { name: "漫画", type: "comic" },
      { name: "韩剧", type: "koreatv" },
      { name: "音乐", type: "music" }
    ];
    const getCategoryName = (type) => {
      const category = categories.find((item) => item.type === type);
      return category ? category.name : "未知分类";
    };
    const checkAdmin = () => {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo || userInfo.role !== "admin") {
        common_vendor.index.showToast({
          title: "无权限访问",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return false;
      }
      return true;
    };
    const handleSearch = () => {
      currentPage.value = 1;
      hasMore.value = true;
      resourceList.value = [];
      fetchResources();
    };
    const fetchResources = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "list",
            data: {
              keyword: searchKeyword.value,
              page: currentPage.value,
              pageSize: pageSize.value
            }
          }
        });
        if (result.code === 200) {
          if (result.data.list.length < pageSize.value) {
            hasMore.value = false;
          }
          const resourceListWithRecommendedStatus = result.data.list.map(
            (item) => ({
              ...item,
              isRecommended: !!item.recommended
            })
          );
          if (currentPage.value === 1) {
            resourceList.value = resourceListWithRecommendedStatus;
          } else {
            resourceList.value = [
              ...resourceList.value,
              ...resourceListWithRecommendedStatus
            ];
          }
        } else {
          common_vendor.index.showToast({
            title: result.msg || "获取资源失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error(e);
        common_vendor.index.showToast({
          title: "获取资源失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const loadMore = () => {
      if (!hasMore.value || isLoading.value)
        return;
      currentPage.value++;
      fetchResources();
    };
    const toggleRecommend = async (item) => {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo || userInfo.role !== "admin") {
        return common_vendor.index.showToast({
          title: "无权限操作",
          icon: "none"
        });
      }
      const originalState = item.isRecommended;
      item.isRecommended = !originalState;
      item.recommended = !originalState;
      common_vendor.index.showLoading({
        title: originalState ? "取消推荐中..." : "推荐中..."
      });
      try {
        console.log(
          "切换推荐状态，资源ID:",
          item._id,
          "原始状态:",
          originalState,
          "目标状态:",
          !originalState
        );
        const response = await common_vendor.Vs.callFunction({
          name: "recommend",
          data: {
            action: "toggleRecommend",
            data: {
              id: item._id,
              recommend: !originalState
            },
            userInfo
          }
        });
        const result = response.result;
        console.log("云函数返回结果:", result);
        if (result && result.code === 200) {
          common_vendor.index.showToast({
            title: result.msg || (!originalState ? "已推荐到首页" : "已取消推荐"),
            icon: "success"
          });
          try {
            console.log("发送refreshRecommendList事件，通知首页更新");
            common_vendor.index.$emit("refreshRecommendList");
          } catch (emitError) {
            console.warn("发送刷新事件失败，但操作已成功:", emitError);
          }
        } else {
          item.isRecommended = originalState;
          item.recommended = originalState;
          common_vendor.index.showToast({
            title: (result == null ? void 0 : result.msg) || "操作失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("推荐操作失败:", e);
        item.isRecommended = originalState;
        item.recommended = originalState;
        common_vendor.index.showToast({
          title: "网络异常，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const goBack = () => {
      console.log("退出推荐管理页面，发送刷新事件");
      const app = getApp();
      if (app.globalData) {
        app.globalData.recommendUpdated = true;
      } else {
        app.globalData = { recommendUpdated: true };
      }
      try {
        common_vendor.index.$emit("refreshRecommendList");
      } catch (error) {
        console.error("发送刷新事件失败:", error);
      }
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      if (checkAdmin()) {
        fetchResources();
      }
    });
    common_vendor.onUnmounted(() => {
      console.log("推荐管理页面卸载，发送刷新事件");
      try {
        common_vendor.index.$emit("refreshRecommendList");
      } catch (error) {
        console.error("页面卸载时发送刷新事件失败:", error);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(handleSearch),
        e: resourceList.value.length > 0
      }, resourceList.value.length > 0 ? {
        f: common_vendor.f(resourceList.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getCategoryName(item.resourceType)),
            d: common_vendor.t(item.description),
            e: common_vendor.t(item.isRecommended ? "取消推荐" : "推荐"),
            f: common_vendor.n({
              recommended: item.isRecommended
            }),
            g: common_vendor.o(($event) => toggleRecommend(item), index),
            h: index
          };
        })
      } : isLoading.value ? {} : {}, {
        g: isLoading.value,
        h: hasMore.value && resourceList.value.length > 0
      }, hasMore.value && resourceList.value.length > 0 ? {
        i: common_vendor.o(loadMore)
      } : {}, {
        j: common_vendor.o(goBack)
      });
    };
  }
};
wx.createPage(_sfc_main);
