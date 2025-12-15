"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "search",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const searchResult = common_vendor.ref([]);
    const hasSearched = common_vendor.ref(false);
    const allCategories = common_vendor.ref([
      { type: "tv", name: "电视剧" },
      { type: "movie", name: "电影" },
      { type: "software", name: "软件" },
      { type: "book", name: "小说" },
      { type: "shortvideo", name: "短剧" },
      { type: "anime", name: "动漫" },
      { type: "variety", name: "综艺" },
      { type: "usatv", name: "美剧" },
      { type: "comic", name: "漫画" },
      { type: "koreatv", name: "韩剧" },
      { type: "music", name: "音乐" },
      { type: "more", name: "更多" }
    ]);
    const getCategoryName = (type) => {
      const category = allCategories.value.find((item) => item.type === type);
      return category ? category.name : "未知分类";
    };
    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入搜索关键词",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "搜索中..."
      });
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "search",
            data: {
              keyword: searchKeyword.value.trim()
            }
          }
        });
        if (result.code === 200) {
          searchResult.value = result.data || [];
          hasSearched.value = true;
        } else {
          common_vendor.index.showToast({
            title: result.message || "搜索失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("搜索异常:", e);
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleResourceClick = (item) => {
      if (!item || !item._id) {
        common_vendor.index.showToast({
          title: "资源数据不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/resource/detail?id=${item._id}`
      });
    };
    common_vendor.onLoad((options) => {
      if (options && options.keyword) {
        searchKeyword.value = decodeURIComponent(options.keyword);
        handleSearch();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(handleSearch),
        e: hasSearched.value
      }, hasSearched.value ? {
        f: common_vendor.t(searchResult.value.length)
      } : {}, {
        g: searchResult.value.length > 0
      }, searchResult.value.length > 0 ? {
        h: common_vendor.f(searchResult.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(getCategoryName(item.resourceType)),
            d: common_vendor.t(item.description),
            e: index,
            f: common_vendor.o(($event) => handleResourceClick(item), index)
          };
        })
      } : hasSearched.value ? {} : {}, {
        i: hasSearched.value
      });
    };
  }
};
wx.createPage(_sfc_main);
