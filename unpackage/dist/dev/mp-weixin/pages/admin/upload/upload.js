"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "upload",
  setup(__props) {
    const resourceTypes = common_vendor.ref([
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
      { name: "音乐", type: "music" },
      { name: "更多", type: "more" }
    ]);
    const resourceTypeIndex = common_vendor.ref(0);
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const link = common_vendor.ref("");
    const cover = common_vendor.ref("");
    const selectedSubTypes = common_vendor.ref([]);
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
    const subTypesMap = {
      tv: [
        { name: "都市", type: "urban" },
        { name: "家庭", type: "family" },
        { name: "爱情", type: "romance" },
        { name: "古装", type: "historical" },
        { name: "玄幻", type: "fantasy" },
        { name: "悬疑", type: "suspense" }
      ],
      movie: [
        { name: "爱情", type: "romance" },
        { name: "喜剧", type: "comedy" },
        { name: "奇幻", type: "fantasy" },
        { name: "青春", type: "youth" },
        { name: "恐怖", type: "horror" },
        { name: "动画", type: "animation" },
        { name: "科幻", type: "sci-fi" },
        { name: "动作", type: "action" },
        { name: "战争", type: "war" }
      ],
      software: [
        { name: "办公", type: "office" },
        { name: "编程", type: "programming" },
        { name: "图像图形", type: "graphics" },
        { name: "建模", type: "modeling" },
        { name: "社交", type: "social" }
      ],
      book: [
        { name: "言情", type: "romance" },
        { name: "耽美", type: "bl" },
        { name: "玄幻", type: "fantasy" },
        { name: "武侠", type: "martial" },
        { name: "悬疑", type: "suspense" },
        { name: "科幻", type: "sci-fi" },
        { name: "历史", type: "historical" }
      ],
      comic: [
        { name: "古代", type: "ancient" },
        { name: "现代", type: "modern" },
        { name: "玄幻", type: "fantasy" }
      ],
      koreatv: [
        { name: "都市", type: "urban" },
        { name: "爱情", type: "romance" },
        { name: "悬疑", type: "suspense" },
        { name: "校园", type: "campus" },
        { name: "古装", type: "historical" },
        { name: "职场", type: "workplace" }
      ],
      music: [
        { name: "流行", type: "pop" },
        { name: "欧美", type: "western" },
        { name: "粤语", type: "cantonese" }
      ]
    };
    const currentResourceType = common_vendor.computed(() => {
      return resourceTypes.value[resourceTypeIndex.value].type;
    });
    const showSubTypes = common_vendor.computed(() => {
      return !!subTypesMap[currentResourceType.value];
    });
    const currentSubTypes = common_vendor.computed(() => {
      return subTypesMap[currentResourceType.value] || [];
    });
    const handleResourceTypeChange = (e) => {
      resourceTypeIndex.value = e.detail.value;
      selectedSubTypes.value = [];
    };
    const handleSubTypesChange = (e) => {
      selectedSubTypes.value = e.detail.value;
    };
    const handleCoverUpload = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          common_vendor.index.showLoading({
            title: "上传中..."
          });
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.Vs.uploadFile({
            filePath: tempFilePath,
            cloudPath: `resources/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`,
            success: (res2) => {
              cover.value = res2.fileID;
              common_vendor.index.hideLoading();
            },
            fail: (err) => {
              console.error(err);
              common_vendor.index.showToast({
                title: "上传失败",
                icon: "none"
              });
              common_vendor.index.hideLoading();
            }
          });
        }
      });
    };
    const handleDeleteCover = () => {
      cover.value = "";
    };
    const handleSubmit = () => {
      if (!title.value) {
        return common_vendor.index.showToast({
          title: "请输入资源名称",
          icon: "none"
        });
      }
      if (!description.value) {
        return common_vendor.index.showToast({
          title: "请输入资源简介",
          icon: "none"
        });
      }
      if (!link.value) {
        return common_vendor.index.showToast({
          title: "请输入资源链接",
          icon: "none"
        });
      }
      if (!cover.value) {
        return common_vendor.index.showToast({
          title: "请上传封面图片",
          icon: "none"
        });
      }
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo || userInfo.role !== "admin") {
        return common_vendor.index.showToast({
          title: "无权限操作",
          icon: "none"
        });
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      common_vendor.Vs.callFunction({
        name: "resources",
        data: {
          action: "add",
          userInfo,
          data: {
            resourceType: currentResourceType.value,
            types: selectedSubTypes.value,
            title: title.value,
            description: description.value,
            link: link.value,
            cover: cover.value,
            createTime: (/* @__PURE__ */ new Date()).getTime()
          }
        }
      }).then((res) => {
        const { result } = res;
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "添加成功",
            icon: "success"
          });
          resourceTypeIndex.value = 0;
          title.value = "";
          description.value = "";
          link.value = "";
          cover.value = "";
          selectedSubTypes.value = [];
        } else {
          throw new Error(result.msg || "添加失败");
        }
      }).catch((err) => {
        console.error(err);
        common_vendor.index.showToast({
          title: err.message || "添加失败",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(() => {
      checkAdmin();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(resourceTypes.value[resourceTypeIndex.value].name),
        b: common_vendor.o(handleResourceTypeChange),
        c: resourceTypeIndex.value,
        d: resourceTypes.value,
        e: showSubTypes.value
      }, showSubTypes.value ? {
        f: common_vendor.f(currentSubTypes.value, (item, index, i0) => {
          return {
            a: item.type,
            b: selectedSubTypes.value.includes(item.type),
            c: common_vendor.t(item.name),
            d: index
          };
        }),
        g: common_vendor.o(handleSubTypesChange)
      } : {}, {
        h: title.value,
        i: common_vendor.o(($event) => title.value = $event.detail.value),
        j: description.value,
        k: common_vendor.o(($event) => description.value = $event.detail.value),
        l: link.value,
        m: common_vendor.o(($event) => link.value = $event.detail.value),
        n: !cover.value
      }, !cover.value ? {
        o: common_vendor.o(handleCoverUpload)
      } : {
        p: cover.value,
        q: common_vendor.o(handleDeleteCover)
      }, {
        r: common_vendor.o(handleSubmit),
        s: common_vendor.o(goBack)
      });
    };
  }
};
wx.createPage(_sfc_main);
