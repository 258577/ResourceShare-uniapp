"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _component_uni_load_more = common_vendor.resolveComponent("uni-load-more");
  _component_uni_load_more();
}
const limit = 6;
const _sfc_main = {
  __name: "RecommendResources",
  setup(__props, { expose: __expose }) {
    const recommendList = common_vendor.ref([]);
    const loading = common_vendor.ref(true);
    const fetchRecommendedResources = async (forceRefresh = false) => {
      console.log(
        "RecommendResources组件: fetchRecommendedResources调用，forceRefresh =",
        forceRefresh
      );
      if (loading.value && !forceRefresh) {
        console.log("RecommendResources组件: 正在加载中，跳过重复请求");
        return;
      }
      if (forceRefresh) {
        console.log("RecommendResources组件: 强制刷新模式，重置loading状态");
        loading.value = false;
        recommendList.value = [];
      }
      loading.value = true;
      try {
        console.log("RecommendResources组件: 开始获取推荐资源, limit =", limit);
        const response = await common_vendor.Vs.callFunction({
          name: "recommend",
          data: {
            action: "getRecommended",
            data: {
              limit,
              _timestamp: Date.now()
              // 添加时间戳防止缓存
            }
          }
        }).catch((error) => {
          console.error("RecommendResources组件: 云函数调用异常:", error);
          throw error;
        });
        if (!response) {
          console.error("RecommendResources组件: 云函数返回为空");
          recommendList.value = [];
          return;
        }
        console.log("RecommendResources组件: 云函数原始返回:", response);
        const result = response.result;
        console.log("RecommendResources组件: 提取的result对象:", result);
        if (result && result.code === 200) {
          const resources = result.data || [];
          if (Array.isArray(resources)) {
            recommendList.value = resources;
            console.log(
              "RecommendResources组件: 成功获取推荐资源，数量:",
              recommendList.value.length
            );
          } else {
            console.error("RecommendResources组件: 返回数据不是数组:", resources);
            recommendList.value = [];
          }
        } else {
          const errorMsg = (result == null ? void 0 : result.msg) || "未知错误";
          console.error("RecommendResources组件: 获取推荐资源失败:", errorMsg);
          recommendList.value = [];
        }
      } catch (error) {
        console.error("RecommendResources组件: 获取推荐资源异常:", error);
        recommendList.value = [];
        common_vendor.index.showToast({
          title: "加载推荐资源失败，请稍后再试",
          icon: "none",
          duration: 2e3
        });
      } finally {
        console.log("RecommendResources组件: 请求完成，重置loading状态");
        loading.value = false;
      }
    };
    const refreshData = () => {
      console.log("RecommendResources组件: 强制刷新数据");
      if (loading.value) {
        console.log("RecommendResources组件: 已有请求正在进行，将在完成后刷新");
        setTimeout(() => {
          if (!loading.value) {
            console.log("RecommendResources组件: 延迟刷新执行");
            fetchRecommendedResources(true);
          }
        }, 500);
        return;
      }
      loading.value = true;
      recommendList.value = [];
      console.log("RecommendResources组件: 立即刷新数据");
      setTimeout(() => {
        fetchRecommendedResources(true);
      }, 100);
    };
    const goToDetail = (item) => {
      if (!item || !item._id) {
        console.error("RecommendResources组件: 资源ID不存在");
        return;
      }
      console.log("RecommendResources组件: 跳转到资源详情页:", item._id);
      common_vendor.index.navigateTo({
        url: `/pages/resource/detail?id=${item._id}`,
        fail: (err) => {
          console.error("RecommendResources组件: 详情页面跳转失败:", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      console.log("RecommendResources组件: mounted");
      loading.value = false;
      fetchRecommendedResources();
      common_vendor.index.$on("refreshRecommendList", () => {
        try {
          console.log("RecommendResources组件: 收到刷新事件，立即刷新数据");
          recommendList.value = [];
          setTimeout(() => {
            try {
              fetchRecommendedResources(true);
            } catch (error) {
              console.error("RecommendResources组件: 刷新数据异常:", error);
              loading.value = false;
            }
          }, 500);
        } catch (error) {
          console.error("RecommendResources组件: 处理刷新事件异常:", error);
          loading.value = false;
        }
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("refreshRecommendList");
    });
    common_vendor.onShow(() => {
      try {
        console.log("RecommendResources组件: onShow触发");
        const app = getApp();
        if (app.globalData && app.globalData.recommendUpdated) {
          console.log("RecommendResources组件: 检测到全局更新标记，主动刷新数据");
          app.globalData.recommendUpdated = false;
          refreshData();
          return;
        }
        const pages = getCurrentPages();
        if (pages && pages.length > 1) {
          const prevPage = pages[pages.length - 2];
          if ((prevPage == null ? void 0 : prevPage.route) && (prevPage.route.includes("admin/recommend") || prevPage.route.includes("admin/edit"))) {
            console.log("RecommendResources组件: 从管理页面返回，强制刷新数据");
            fetchRecommendedResources(true);
            return;
          }
        }
        console.log("RecommendResources组件: 页面显示，主动刷新数据");
        refreshData();
      } catch (error) {
        console.error("RecommendResources组件: onShow生命周期异常:", error);
        loading.value = false;
      }
    });
    const getCategoryName = (type) => {
      const categories = {
        tv: "电视剧",
        movie: "电影",
        software: "软件",
        book: "小说",
        shortvideo: "短剧",
        anime: "动漫",
        variety: "综艺",
        usatv: "美剧",
        comic: "漫画",
        koreatv: "韩剧",
        music: "音乐"
      };
      return categories[type] || "其他";
    };
    __expose({
      fetchRecommendedResources,
      refreshData
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {
        b: common_vendor.p({
          status: "loading"
        })
      } : recommendList.value.length === 0 ? {} : {
        d: common_vendor.f(recommendList.value, (item, k0, i0) => {
          return {
            a: item.cover || "/static/images/default-cover.png",
            b: common_vendor.t(item.title),
            c: common_vendor.t(getCategoryName(item.resourceType)),
            d: common_vendor.t(item.viewCount || 0),
            e: item._id,
            f: common_vendor.o(($event) => goToDetail(item), item._id)
          };
        })
      }, {
        c: recommendList.value.length === 0
      });
    };
  }
};
wx.createComponent(_sfc_main);
