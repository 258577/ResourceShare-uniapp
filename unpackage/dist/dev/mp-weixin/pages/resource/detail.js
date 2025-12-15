"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  FavoriteButton();
}
const FavoriteButton = () => "../../components/FavoriteButton.js";
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const resource = common_vendor.ref(null);
    const getResourceDetail = async (id) => {
      if (!id) {
        console.error("资源ID为空，无法获取详情");
        common_vendor.index.showToast({
          title: "资源ID不能为空",
          icon: "none"
        });
        return;
      }
      try {
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "detail",
            data: { id }
          }
        });
        if (result.code === 200) {
          resource.value = result.data;
        } else if (result.code === 404) {
          showResourceNotExist();
        } else {
          common_vendor.index.showToast({
            title: result.message || "获取资源详情失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("资源详情异常:", e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    };
    const showResourceNotExist = () => {
      resource.value = null;
      common_vendor.index.showToast({
        title: "该资源已被删除或不存在",
        icon: "none",
        duration: 2e3
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 2e3);
    };
    const viewResource = () => {
      if (resource.value && resource.value.link) {
        if (!resource.value._id) {
          console.error("资源ID为空，无法增加浏览计数");
          return;
        }
        common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "incrementView",
            data: { id: resource.value._id }
          }
        }).then(({ result }) => {
          if (result.code !== 200) {
            console.error("浏览计数返回错误:", result.msg);
          }
        }).catch((err) => {
          console.error("浏览计数错误:", err);
        });
        common_vendor.index.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(
            resource.value.link
          )}`
        });
      } else {
        console.error("资源或链接不存在:", resource.value);
        common_vendor.index.showToast({
          title: "资源链接不存在",
          icon: "none"
        });
      }
    };
    common_vendor.onLoad((options) => {
      if (options && options.id) {
        getResourceDetail(options.id);
      } else {
        common_vendor.index.showToast({
          title: "未能获取资源信息",
          icon: "none"
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: resource.value
      }, resource.value ? common_vendor.e({
        b: resource.value.cover,
        c: common_vendor.t(resource.value.title),
        d: common_vendor.p({
          resourceId: resource.value._id,
          title: resource.value.title,
          description: resource.value.description,
          cover: resource.value.cover,
          link: resource.value.link
        }),
        e: common_vendor.t(resource.value.favoriteCount || 0),
        f: common_vendor.t(resource.value.viewCount || 0),
        g: common_vendor.t(resource.value.description),
        h: common_vendor.o(viewResource),
        i: resource.value.content
      }, resource.value.content ? {
        j: resource.value.content
      } : {}) : {});
    };
  }
};
wx.createPage(_sfc_main);
