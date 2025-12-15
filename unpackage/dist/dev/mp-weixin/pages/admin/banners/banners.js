"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      bannerList: [],
      userInfo: null
    };
  },
  onShow() {
    this.checkAdmin();
  },
  methods: {
    // 检查管理员权限
    checkAdmin() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo || userInfo.role !== "admin") {
        common_vendor.index.showToast({
          title: "无权限访问",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      this.userInfo = userInfo;
      this.getBannerList();
    },
    // 获取轮播图列表
    async getBannerList() {
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "banners",
          data: {
            action: "list"
          }
        });
        if (result.code === 200) {
          this.bannerList = result.data || [];
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取轮播图失败",
          icon: "none"
        });
      }
    },
    // 上传轮播图
    handleUpload() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          try {
            const uploadRes = await common_vendor.Vs.uploadFile({
              filePath: tempFilePath,
              cloudPath: `banner/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`
            });
            const { result } = await common_vendor.Vs.callFunction({
              name: "banners",
              data: {
                action: "add",
                userInfo: this.userInfo,
                data: {
                  imageUrl: uploadRes.fileID,
                  link: ""
                }
              }
            });
            if (result.code === 200) {
              common_vendor.index.showToast({
                title: "上传成功",
                icon: "success"
              });
              this.getBannerList();
              common_vendor.index.$emit("refreshBannerList");
            } else {
              throw new Error(result.msg);
            }
          } catch (e) {
            common_vendor.index.showToast({
              title: "上传失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    },
    // 更新链接
    async handleUpdateLink(item) {
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "banners",
          data: {
            action: "update",
            userInfo: this.userInfo,
            data: {
              _id: item._id,
              link: item.link
            }
          }
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          common_vendor.index.$emit("refreshBannerList");
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "更新失败",
          icon: "none"
        });
      }
    },
    // 删除轮播图
    async handleDelete(item) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这张轮播图吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const { result } = await common_vendor.Vs.callFunction({
                name: "banners",
                data: {
                  action: "remove",
                  userInfo: this.userInfo,
                  data: {
                    _id: item._id
                  }
                }
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                this.getBannerList();
                common_vendor.index.$emit("refreshBannerList");
              }
            } catch (e) {
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 跳转到资源上传管理页面
    goToResourceUpload() {
      common_vendor.index.navigateTo({
        url: "/pages/admin/upload/upload"
      });
    },
    // 返回上一页
    goBack() {
      getApp().globalData = getApp().globalData || {};
      getApp().globalData.bannerUpdated = true;
      common_vendor.index.navigateBack();
    }
  },
  // 在页面卸载前发送通知
  onUnload() {
    common_vendor.index.$emit("refreshBannerList");
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.bannerList.length === 0
  }, $data.bannerList.length === 0 ? {
    b: common_assets._imports_0
  } : {
    c: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.imageUrl,
        b: common_vendor.o(($event) => $options.handleUpdateLink(item), index),
        c: item.link,
        d: common_vendor.o(($event) => item.link = $event.detail.value, index),
        e: common_vendor.o(($event) => $options.handleDelete(item), index),
        f: index
      };
    })
  }, {
    d: common_vendor.o((...args) => $options.handleUpload && $options.handleUpload(...args)),
    e: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
