"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "favorite",
  setup(__props) {
    const userInfo = common_vendor.ref(null);
    const favoriteList = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const getUserInfo = () => {
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      if (storedUserInfo) {
        userInfo.value = storedUserInfo;
        getFavoriteList();
      }
    };
    const getFavoriteList = async (isRefresh = false) => {
      if (isRefresh) {
        page.value = 1;
        hasMore.value = true;
      }
      if (!hasMore.value && !isRefresh)
        return;
      loading.value = true;
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "favorites",
          data: {
            action: "list",
            data: {
              userId: userInfo.value._id,
              page: page.value,
              pageSize: pageSize.value
            }
          }
        });
        if (result.code === 200) {
          if (isRefresh) {
            favoriteList.value = result.data;
          } else {
            favoriteList.value = [...favoriteList.value, ...result.data];
          }
          hasMore.value = result.data.length === pageSize.value;
          if (hasMore.value) {
            page.value++;
          }
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取收藏失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
        if (isRefresh) {
          refreshing.value = false;
        }
      }
    };
    const onRefresh = () => {
      refreshing.value = true;
      getFavoriteList(true);
    };
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        getFavoriteList();
      }
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const goLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    const handleUnfavorite = (index) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定取消收藏该资源吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const item = favoriteList.value[index];
              const { result } = await common_vendor.Vs.callFunction({
                name: "favorites",
                data: {
                  action: "remove",
                  data: {
                    userId: userInfo.value._id,
                    resourceId: item.resourceId
                  }
                }
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "已取消收藏",
                  icon: "success"
                });
                favoriteList.value.splice(index, 1);
              } else {
                common_vendor.index.showToast({
                  title: result.message || "操作失败",
                  icon: "none"
                });
              }
            } catch (e) {
              console.error(e);
              common_vendor.index.showToast({
                title: "操作失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const handleView = async (item) => {
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "detail",
            data: { id: item.resourceId }
          }
        });
        if (result.code === 200) {
          common_vendor.index.navigateTo({
            url: `/pages/resource/detail?id=${item.resourceId}`
          });
        } else {
          common_vendor.index.showToast({
            title: "该资源已不存在",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (e) {
        console.error("检查资源失败:", e);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    common_vendor.onShow(() => {
      if (userInfo.value) {
        getFavoriteList(true);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !userInfo.value
      }, !userInfo.value ? {
        b: common_vendor.o(goLogin)
      } : common_vendor.e({
        c: favoriteList.value.length === 0
      }, favoriteList.value.length === 0 ? {} : {}, {
        d: common_vendor.f(favoriteList.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.description),
            d: common_vendor.t(formatDate(item.createTime)),
            e: common_vendor.o(($event) => handleUnfavorite(index), index),
            f: common_vendor.o(($event) => handleView(item), index),
            g: index
          };
        }),
        e: loading.value
      }, loading.value ? {} : {}, {
        f: common_vendor.o(loadMore),
        g: refreshing.value,
        h: common_vendor.o(onRefresh)
      }));
    };
  }
};
wx.createPage(_sfc_main);
