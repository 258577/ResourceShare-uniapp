"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Math) {
  RecommendResources();
}
const RecommendResources = () => "../../components/RecommendResources.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const bannerList = common_vendor.ref([]);
    const isLoadingBanners = common_vendor.ref(false);
    const categories = common_vendor.ref([
      {
        name: "电视剧",
        icon: "/static/category/tv.png",
        type: "tv"
      },
      {
        name: "电影",
        icon: "/static/category/movie.png",
        type: "movie"
      },
      {
        name: "软件",
        icon: "/static/category/software.png",
        type: "software"
      },
      {
        name: "小说",
        icon: "/static/category/book.png",
        type: "book"
      },
      {
        name: "短剧",
        icon: "/static/category/shortvideo.png",
        type: "shortvideo"
      },
      {
        name: "动漫",
        icon: "/static/category/anime.png",
        type: "anime"
      },
      {
        name: "综艺",
        icon: "/static/category/variety.png",
        type: "variety"
      },
      {
        name: "美剧",
        icon: "/static/category/usatv.png",
        type: "usatv"
      },
      {
        name: "漫画",
        icon: "/static/category/comic.png",
        type: "comic"
      },
      {
        name: "韩剧",
        icon: "/static/category/koreatv.png",
        type: "koreatv"
      },
      {
        name: "音乐",
        icon: "/static/category/music.png",
        type: "music"
      },
      {
        name: "全部",
        icon: "/static/category/more.png",
        type: "more"
      }
    ]);
    const userInfo = common_vendor.ref(null);
    const getUserInfo = () => {
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo) {
        userInfo.value = storedUserInfo;
      }
    };
    const getBannerList = async () => {
      var _a;
      if (isLoadingBanners.value) {
        console.log("正在加载轮播图，跳过重复请求");
        return;
      }
      try {
        isLoadingBanners.value = true;
        console.log("开始获取轮播图");
        const { result } = await common_vendor.Vs.callFunction({
          name: "banners",
          data: {
            action: "list"
          }
        });
        if (result.code === 200) {
          console.log("获取轮播图成功，数量:", ((_a = result.data) == null ? void 0 : _a.length) || 0);
          bannerList.value = result.data || [];
        } else {
          console.error("获取轮播图失败：", result.msg);
          common_vendor.index.showToast({
            title: "获取轮播图失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("获取轮播图异常：", e);
        common_vendor.index.showToast({
          title: "获取轮播图失败",
          icon: "none"
        });
      } finally {
        isLoadingBanners.value = false;
      }
    };
    const handleBannerClick = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.link)}`
      });
    };
    const handleCategoryClick = (item) => {
      if (item.type === "more") {
        handleMoreCategoryClick();
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/resource/${item.type}`
        });
      }
    };
    const navigateToSearch = () => {
      common_vendor.index.navigateTo({
        url: "/pages/category/allCategories"
      });
    };
    const handleMoreCategoryClick = () => {
      common_vendor.index.navigateTo({
        url: "/pages/category/allCategories"
      });
    };
    common_vendor.onMounted(() => {
      getBannerList();
      getUserInfo();
      common_vendor.index.$on("refreshRecommendList", () => {
        console.log("收到首页推荐资源刷新通知");
        try {
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          if (currentPage && currentPage.$refs) {
            const recommendComponent = currentPage.$refs.recommendResources;
            if (recommendComponent) {
              console.log(
                "首页: 收到刷新事件，优先调用fetchRecommendedResources方法"
              );
              try {
                recommendComponent.fetchRecommendedResources(true);
              } catch (directError) {
                console.error(
                  "直接调用fetchRecommendedResources失败:",
                  directError
                );
                console.log("首页: 尝试调用refreshData方法作为备选");
                recommendComponent.refreshData();
              }
            } else {
              console.log("首页: 未找到推荐资源组件引用");
            }
          }
        } catch (error) {
          console.error("首页: 处理refreshRecommendList事件出错:", error);
        }
      });
      common_vendor.index.$on("refreshBannerList", () => {
        console.log("收到首页轮播图刷新通知");
        getBannerList();
      });
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("refreshRecommendList");
      common_vendor.index.$off("refreshBannerList");
    });
    common_vendor.onShow(() => {
      console.log("首页: onShow事件触发");
      getBannerList();
      getUserInfo();
      try {
        console.log("首页: 主动刷新推荐资源列表");
        const pages2 = getCurrentPages();
        const currentPage = pages2[pages2.length - 1];
        if (currentPage && currentPage.$refs) {
          const recommendComponent = currentPage.$refs.recommendResources;
          if (recommendComponent) {
            console.log("首页: 找到推荐资源组件，调用刷新方法");
            recommendComponent.refreshData();
          } else {
            console.log("首页: 未找到推荐资源组件引用");
          }
        }
      } catch (error) {
        console.error("首页: 刷新推荐资源时出错:", error);
      }
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.route && prevPage.route.includes("admin/banners")) {
          console.log("从轮播图管理页面返回");
          getBannerList();
        }
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(navigateToSearch),
        b: bannerList.value.length === 0
      }, bannerList.value.length === 0 ? {
        c: common_assets._imports_0
      } : {
        d: common_vendor.f(bannerList.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: common_vendor.o(($event) => handleBannerClick(item), index),
            c: index
          };
        })
      }, {
        e: common_vendor.f(categories.value.slice(0, 4), (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: index,
            d: common_vendor.o(($event) => handleCategoryClick(item), index)
          };
        }),
        f: common_vendor.f(categories.value.slice(4, 8), (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: index + 4,
            d: common_vendor.o(($event) => handleCategoryClick(item), index + 4)
          };
        }),
        g: common_vendor.f(categories.value.slice(8, 12), (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: index + 8,
            d: common_vendor.o(($event) => handleCategoryClick(item), index + 8)
          };
        }),
        h: common_vendor.sr("recommendResources", "2be4c5cc-0")
      });
    };
  }
};
wx.createPage(_sfc_main);
