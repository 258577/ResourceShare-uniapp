"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  FavoriteButton();
}
const FavoriteButton = () => "./FavoriteButton.js";
const _sfc_main = {
  __name: "ResourceCommon",
  props: {
    resourceType: {
      type: String,
      required: true
    },
    menuItems: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const searchKeyword = common_vendor.ref("");
    const currentMenuIndex = common_vendor.ref(0);
    const resources = common_vendor.ref([]);
    const displayResources = common_vendor.ref([]);
    const showMenu = common_vendor.computed(() => {
      return props.menuItems && props.menuItems.length > 0;
    });
    const loadResources = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const { result } = await common_vendor.Vs.callFunction({
          name: "resources",
          data: {
            action: "list",
            data: {
              resourceType: props.resourceType
            }
          }
        });
        if (result.code === 200) {
          resources.value = result.data.list || [];
          filterResources();
        } else {
          common_vendor.index.showToast({
            title: result.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error(e);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const filterResources = () => {
      if (!showMenu.value) {
        displayResources.value = resources.value.filter((item) => {
          return !searchKeyword.value || item.title.includes(searchKeyword.value) || item.description.includes(searchKeyword.value);
        });
        return;
      }
      const currentMenu = props.menuItems[currentMenuIndex.value];
      displayResources.value = resources.value.filter((item) => {
        const typeMatch = !currentMenu || !currentMenu.type || item.types && item.types.includes(currentMenu.type);
        const searchMatch = !searchKeyword.value || item.title.includes(searchKeyword.value) || item.description.includes(searchKeyword.value);
        return typeMatch && searchMatch;
      });
    };
    const handleSearch = () => {
      filterResources();
    };
    const handleMenuSelect = (index, item) => {
      currentMenuIndex.value = index;
      filterResources();
    };
    const handleResourceClick = (item) => {
      if (!item || !item._id) {
        console.error("资源项数据不完整，缺少_id:", item);
        common_vendor.index.showToast({
          title: "资源数据不完整",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/resource/detail?id=${item._id}`,
        fail: (err) => {
          console.error("导航到详情页失败:", err);
        }
      });
    };
    common_vendor.onMounted(() => {
      loadResources();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: common_vendor.o(handleSearch),
        e: showMenu.value
      }, showMenu.value ? {
        f: common_vendor.f(__props.menuItems, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index,
            c: currentMenuIndex.value === index ? 1 : "",
            d: common_vendor.o(($event) => handleMenuSelect(index), index)
          };
        })
      } : {}, {
        g: common_vendor.f(displayResources.value, (item, index, i0) => {
          return {
            a: item.cover,
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.description),
            d: common_vendor.o(($event) => handleResourceClick(item), index),
            e: "b43f97d8-0-" + i0,
            f: common_vendor.p({
              resourceId: item._id,
              title: item.title,
              description: item.description,
              cover: item.cover,
              link: item.link
            }),
            g: index
          };
        }),
        h: displayResources.value.length === 0
      }, displayResources.value.length === 0 ? {} : {});
    };
  }
};
wx.createComponent(_sfc_main);
