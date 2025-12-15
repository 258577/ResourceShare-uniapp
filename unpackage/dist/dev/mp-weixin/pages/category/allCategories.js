"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "allCategories",
  setup(__props) {
    const allCategories = common_vendor.ref([
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
      }
    ]);
    const resourceList = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const activeType = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const getCategoryName = (type) => {
      const category = allCategories.value.find((item) => item.type === type);
      return category ? category.name : "未知分类";
    };
    const handleFilterChange = (type) => {
      activeType.value = type;
      currentPage.value = 1;
      hasMore.value = true;
      resourceList.value = [];
      fetchResources();
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
              resourceType: activeType.value,
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
          if (currentPage.value === 1) {
            resourceList.value = result.data.list;
          } else {
            resourceList.value = [...resourceList.value, ...result.data.list];
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
    const handleResourceClick = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/resource/detail?id=${item._id}`
      });
    };
    common_vendor.onMounted(() => {
      fetchResources();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(handleSearch),
        e: activeType.value === "" ? 1 : "",
        f: common_vendor.o(($event) => handleFilterChange("")),
        g: common_vendor.f(allCategories.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index,
            c: activeType.value === item.type ? 1 : "",
            d: common_vendor.o(($event) => handleFilterChange(item.type), index)
          };
        }),
        h: resourceList.value.length > 0
      }, resourceList.value.length > 0 ? {
        i: common_vendor.f(resourceList.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getCategoryName(item.resourceType)),
            d: common_vendor.t(item.description),
            e: index,
            f: common_vendor.o(($event) => handleResourceClick(item), index)
          };
        })
      } : isLoading.value ? {} : {}, {
        j: isLoading.value,
        k: hasMore.value && resourceList.value.length > 0
      }, hasMore.value && resourceList.value.length > 0 ? {
        l: common_vendor.o(loadMore)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
