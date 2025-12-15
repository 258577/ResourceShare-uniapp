"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const resourceList = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const showEditPopup = common_vendor.ref(false);
    const editForm = common_vendor.ref({
      _id: "",
      title: "",
      resourceType: "",
      link: "",
      description: ""
    });
    const typeOptions = [
      { name: "电视剧", value: "tv" },
      { name: "电影", value: "movie" },
      { name: "软件", value: "software" },
      { name: "小说", value: "book" },
      { name: "短剧", value: "shortvideo" },
      { name: "动漫", value: "anime" },
      { name: "综艺", value: "variety" },
      { name: "美剧", value: "usatv" },
      { name: "漫画", value: "comic" },
      { name: "韩剧", value: "koreatv" },
      { name: "音乐", value: "music" }
    ];
    common_vendor.computed(() => {
      const index = typeOptions.findIndex(
        (item) => item.value === editForm.value.resourceType
      );
      return index >= 0 ? index : 0;
    });
    const getCategoryName = (type) => {
      const category = typeOptions.find((item) => item.value === type);
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
    const editResource = (item) => {
      editForm.value = {
        _id: item._id,
        title: item.title,
        resourceType: item.resourceType,
        link: item.link || "",
        description: item.description
      };
      showEditPopup.value = true;
    };
    const confirmEdit = async () => {
      if (!editForm.value.title || !editForm.value.resourceType || !editForm.value.description) {
        common_vendor.index.showToast({
          title: "标题、类型和简介不能为空",
          icon: "none"
        });
        return;
      }
      if (editForm.value.link && !/(http|https):\/\//.test(editForm.value.link)) {
        common_vendor.index.showToast({
          title: "链接必须以http://或https://开头",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (!userInfo || userInfo.role !== "admin") {
          common_vendor.index.hideLoading();
          return common_vendor.index.showToast({
            title: "无权限操作",
            icon: "none"
          });
        }
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "update",
            data: {
              _id: editForm.value._id,
              title: editForm.value.title,
              resourceType: editForm.value.resourceType,
              link: editForm.value.link,
              description: editForm.value.description
            },
            userInfo
            // 传递用户信息到云函数
          }
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          showEditPopup.value = false;
          handleSearch();
          try {
            const app = getApp();
            if (app.globalData) {
              app.globalData.recommendUpdated = true;
            } else {
              app.globalData = { recommendUpdated: true };
            }
            common_vendor.index.$emit("refreshRecommendList");
            console.log("已发出刷新首页推荐资源的通知");
          } catch (emitError) {
            console.error("发送刷新事件失败:", emitError);
          }
        } else {
          throw new Error(result.msg || "更新失败");
        }
      } catch (err) {
        common_vendor.index.showToast({
          title: err.message || "更新失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const closeEditPopup = () => {
      showEditPopup.value = false;
    };
    const deleteResource = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该资源吗？此操作无法撤销。",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "删除中..."
              });
              const userInfo = common_vendor.index.getStorageSync("userInfo");
              const { result } = await common_vendor.Vs.callFunction({
                name: "resources",
                data: {
                  action: "remove",
                  data: {
                    _id: item._id
                  },
                  userInfo
                  // 传递用户信息到云函数
                }
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                handleSearch();
                common_vendor.index.$emit("refreshRecommendList");
                console.log("已发出刷新首页推荐资源的通知");
              } else {
                throw new Error(result.msg || "删除失败");
              }
            } catch (err) {
              common_vendor.index.showToast({
                title: err.message || "删除失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const goBack = () => {
      console.log("退出资源编辑页面，发送刷新事件");
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
      console.log("资源编辑页面卸载，发送刷新事件");
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
            e: common_vendor.o(($event) => editResource(item), index),
            f: common_vendor.o(($event) => deleteResource(item), index),
            g: index
          };
        })
      } : isLoading.value ? {} : {}, {
        g: isLoading.value,
        h: hasMore.value && resourceList.value.length > 0
      }, hasMore.value && resourceList.value.length > 0 ? {
        i: common_vendor.o(loadMore)
      } : {}, {
        j: common_vendor.o(goBack),
        k: showEditPopup.value
      }, showEditPopup.value ? {
        l: common_vendor.o(closeEditPopup),
        m: common_vendor.o(closeEditPopup),
        n: editForm.value.title,
        o: common_vendor.o(($event) => editForm.value.title = $event.detail.value),
        p: common_vendor.f(typeOptions, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index,
            c: editForm.value.resourceType === item.value ? 1 : "",
            d: common_vendor.o(($event) => editForm.value.resourceType = item.value, index)
          };
        }),
        q: editForm.value.link,
        r: common_vendor.o(($event) => editForm.value.link = $event.detail.value),
        s: editForm.value.description,
        t: common_vendor.o(($event) => editForm.value.description = $event.detail.value),
        v: common_vendor.o(closeEditPopup),
        w: common_vendor.o(confirmEdit)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
