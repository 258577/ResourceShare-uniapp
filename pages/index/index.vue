<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box" @click="navigateToSearch">
        <text class="iconfont icon-search"></text>
        <view class="search-input">搜索资源</view>
        <text class="search-btn">搜索</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper
      class="banner"
      circular
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
    >
      <!-- 无轮播图时显示默认图片 -->
      <swiper-item v-if="bannerList.length === 0">
        <view class="empty-banner">
          <image src="/static/empty-banner.png" mode="aspectFill"></image>
          <text>暂无轮播图</text>
        </view>
      </swiper-item>
      <!-- 有轮播图时显示轮播内容 -->
      <swiper-item v-else v-for="(item, index) in bannerList" :key="index">
        <image
          :src="item.imageUrl"
          mode="aspectFill"
          @click="handleBannerClick(item)"
        ></image>
      </swiper-item>
    </swiper>

    <!-- 资源分类 -->
    <view class="category-container">
      <view class="category-row">
        <view
          class="category-item"
          v-for="(item, index) in categories.slice(0, 4)"
          :key="index"
          @click="handleCategoryClick(item)"
        >
          <image :src="item.icon" mode="aspectFit"></image>
          <text>{{ item.name }}</text>
        </view>
      </view>
      <view class="category-row">
        <view
          class="category-item"
          v-for="(item, index) in categories.slice(4, 8)"
          :key="index + 4"
          @click="handleCategoryClick(item)"
        >
          <image :src="item.icon" mode="aspectFit"></image>
          <text>{{ item.name }}</text>
        </view>
      </view>
      <view class="category-row">
        <view
          class="category-item"
          v-for="(item, index) in categories.slice(8, 12)"
          :key="index + 8"
          @click="handleCategoryClick(item)"
        >
          <image :src="item.icon" mode="aspectFit"></image>
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 使用推荐资源组件 -->
    <recommend-resources ref="recommendResources" />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import RecommendResources from "@/components/RecommendResources.vue";

// 数据定义
const bannerList = ref([]);
const isLoadingBanners = ref(false);
const categories = ref([
  {
    name: "电视剧",
    icon: "/static/category/tv.png",
    type: "tv",
  },
  {
    name: "电影",
    icon: "/static/category/movie.png",
    type: "movie",
  },
  {
    name: "软件",
    icon: "/static/category/software.png",
    type: "software",
  },
  {
    name: "小说",
    icon: "/static/category/book.png",
    type: "book",
  },
  {
    name: "短剧",
    icon: "/static/category/shortvideo.png",
    type: "shortvideo",
  },
  {
    name: "动漫",
    icon: "/static/category/anime.png",
    type: "anime",
  },
  {
    name: "综艺",
    icon: "/static/category/variety.png",
    type: "variety",
  },
  {
    name: "美剧",
    icon: "/static/category/usatv.png",
    type: "usatv",
  },
  {
    name: "漫画",
    icon: "/static/category/comic.png",
    type: "comic",
  },
  {
    name: "韩剧",
    icon: "/static/category/koreatv.png",
    type: "koreatv",
  },
  {
    name: "音乐",
    icon: "/static/category/music.png",
    type: "music",
  },
  {
    name: "全部",
    icon: "/static/category/more.png",
    type: "more",
  },
]);
const userInfo = ref(null);

// 方法定义
const getUserInfo = () => {
  const storedUserInfo = uni.getStorageSync("userInfo");
  if (storedUserInfo) {
    userInfo.value = storedUserInfo;
  }
};

const goLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

const goToBannerManage = () => {
  uni.navigateTo({
    url: "/pages/admin/banners/banners",
  });
};

const goToFavorites = () => {
  uni.switchTab({
    url: "/pages/favorite/favorite",
  });
};

const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync("userInfo");
        userInfo.value = null;
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};

const getBannerList = async () => {
  // 避免重复请求
  if (isLoadingBanners.value) {
    console.log("正在加载轮播图，跳过重复请求");
    return;
  }

  try {
    isLoadingBanners.value = true;
    console.log("开始获取轮播图");

    const { result } = await uniCloud.callFunction({
      name: "banners",
      data: {
        action: "list",
      },
    });

    if (result.code === 200) {
      console.log("获取轮播图成功，数量:", result.data?.length || 0);
      bannerList.value = result.data || [];
    } else {
      console.error("获取轮播图失败：", result.msg);
      uni.showToast({
        title: "获取轮播图失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("获取轮播图异常：", e);
    uni.showToast({
      title: "获取轮播图失败",
      icon: "none",
    });
  } finally {
    isLoadingBanners.value = false;
  }
};

const handleBannerClick = (item) => {
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent(item.link)}`,
  });
};

const handleCategoryClick = (item) => {
  if (item.type === "more") {
    handleMoreCategoryClick();
  } else {
    uni.navigateTo({
      url: `/pages/resource/${item.type}`,
    });
  }
};

const handleUpload = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];

      uni.showLoading({
        title: "上传中...",
      });

      try {
        const uploadRes = await uniCloud.uploadFile({
          filePath: tempFilePath,
          cloudPath: `banner/${Date.now()}-${Math.random()
            .toString(36)
            .slice(-6)}.jpg`,
        });

        const { result } = await uniCloud.callFunction({
          name: "banners",
          data: {
            action: "add",
            data: {
              imageUrl: uploadRes.fileID,
              link: "",
            },
          },
        });

        if (result.code === 200) {
          uni.showToast({
            title: "上传成功",
            icon: "success",
          });
          getBannerList();
        } else {
          throw new Error(result.msg);
        }
      } catch (e) {
        uni.showToast({
          title: "上传失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },
  });
};

const handleUpdateLink = async (item) => {
  try {
    const { result } = await uniCloud.callFunction({
      name: "banners",
      data: {
        action: "update",
        data: {
          _id: item._id,
          link: item.link,
        },
      },
    });

    if (result.code === 200) {
      uni.showToast({
        title: "更新成功",
        icon: "success",
      });
    }
  } catch (e) {
    uni.showToast({
      title: "更新失败",
      icon: "none",
    });
  }
};

const handleDelete = async (item) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除这张轮播图吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const { result } = await uniCloud.callFunction({
            name: "banners",
            data: {
              action: "remove",
              data: {
                _id: item._id,
              },
            },
          });

          if (result.code === 200) {
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
            getBannerList();
          }
        } catch (e) {
          uni.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

// 点击搜索框跳转到全部资源页面
const navigateToSearch = () => {
  uni.navigateTo({
    url: "/pages/category/allCategories",
  });
};

// 处理"更多"分类点击
const handleMoreCategoryClick = () => {
  uni.navigateTo({
    url: "/pages/category/allCategories",
  });
};

// 生命周期
onMounted(() => {
  getBannerList();
  getUserInfo();

  // 监听推荐状态变化
  uni.$on("refreshRecommendList", () => {
    console.log("收到首页推荐资源刷新通知");
    // 获取 RecommendResources 组件实例并调用其刷新方法
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
            // 首先尝试直接调用fetchRecommendedResources
            recommendComponent.fetchRecommendedResources(true); // 使用强制刷新模式
          } catch (directError) {
            console.error(
              "直接调用fetchRecommendedResources失败:",
              directError
            );
            // 如果失败，尝试调用refreshData方法
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

  // 监听轮播图变化
  uni.$on("refreshBannerList", () => {
    console.log("收到首页轮播图刷新通知");
    getBannerList();
  });
});

onUnmounted(() => {
  // 移除事件监听
  uni.$off("refreshRecommendList");
  uni.$off("refreshBannerList");
});

// 每次页面显示时
onShow(() => {
  console.log("首页: onShow事件触发");
  // 每次显示页面时刷新轮播图和用户信息
  getBannerList();
  getUserInfo();

  // 获取并刷新推荐资源列表
  try {
    console.log("首页: 主动刷新推荐资源列表");
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.$refs) {
      const recommendComponent = currentPage.$refs.recommendResources;
      if (recommendComponent) {
        console.log("首页: 找到推荐资源组件，调用刷新方法");
        // 使用refreshData方法，它内部会正确处理loading状态
        recommendComponent.refreshData();
      } else {
        console.log("首页: 未找到推荐资源组件引用");
      }
    }
  } catch (error) {
    console.error("首页: 刷新推荐资源时出错:", error);
  }

  // 检查前一个页面是否为轮播图管理页面
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2];
    if (
      prevPage &&
      prevPage.route &&
      prevPage.route.includes("admin/banners")
    ) {
      console.log("从轮播图管理页面返回");
      getBannerList();
    }
  }
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;

  .search-container {
    padding-bottom: 20rpx;

    .search-box {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 50rpx;
      padding: 10rpx 30rpx;

      .icon-search {
        font-size: 36rpx;
        color: #999;
        margin-right: 10rpx;
      }

      .search-input {
        flex: 1;
        height: 60rpx;
        font-size: 28rpx;
      }

      .search-btn {
        font-size: 28rpx;
        color: #007aff;
        padding: 0 10rpx;
      }
    }
  }

  .banner {
    height: 300rpx;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 20rpx;

    .empty-banner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;

      image {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #999;
      }
    }

    image {
      width: 100%;
      height: 100%;
    }
  }

  .category-container {
    display: flex;
    flex-direction: column;
    padding: 30rpx 0;

    .category-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 30rpx;

      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25%;

        image {
          width: 80rpx;
          height: 80rpx;
          margin-bottom: 10rpx;
        }

        text {
          font-size: 24rpx;
          color: #333;
        }
      }
    }
  }

  .resource-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .section-title {
        font-size: 32rpx;
        font-weight: bold;
        position: relative;
        padding-left: 20rpx;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 30rpx;
          background-color: #007aff;
          border-radius: 4rpx;
        }
      }
    }

    .empty-tip {
      text-align: center;
      padding: 50rpx 0;
      color: #999;
      font-size: 28rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      image {
        width: 150rpx;
        height: 150rpx;
        margin-bottom: 20rpx;
        opacity: 0.7;
      }

      .sub-tip {
        font-size: 24rpx;
        color: #bbb;
        margin-top: 10rpx;
      }
    }
  }

  .resource-list {
    .resource-item {
      display: flex;
      margin-bottom: 30rpx;
      background-color: #fff;
      border-radius: 10rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

      image {
        width: 200rpx;
        height: 200rpx;
      }

      .info {
        flex: 1;
        padding: 20rpx;

        .title {
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }

        .desc {
          font-size: 26rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
