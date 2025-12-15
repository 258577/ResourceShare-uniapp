<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onShow } from "@dcloudio/uni-app";

const recommendList = ref([]);
const loading = ref(true);
const limit = 6; // 默认显示6个推荐资源

// 获取推荐资源列表
const fetchRecommendedResources = async (forceRefresh = false) => {
  console.log(
    "RecommendResources组件: fetchRecommendedResources调用，forceRefresh =",
    forceRefresh
  );

  // 如果正在加载且非强制刷新，则跳过
  if (loading.value && !forceRefresh) {
    console.log("RecommendResources组件: 正在加载中，跳过重复请求");
    return;
  }

  // 如果强制刷新，重置loading状态
  if (forceRefresh) {
    console.log("RecommendResources组件: 强制刷新模式，重置loading状态");
    loading.value = false;
    // 清空列表，显示加载中状态
    recommendList.value = [];
  }

  // 设置加载状态
  loading.value = true;

  try {
    console.log("RecommendResources组件: 开始获取推荐资源, limit =", limit);

    // 直接调用云函数获取推荐资源
    const response = await uniCloud
      .callFunction({
        name: "recommend",
        data: {
          action: "getRecommended",
          data: {
            limit: limit,
            _timestamp: Date.now(), // 添加时间戳防止缓存
          },
        },
      })
      .catch((error) => {
        console.error("RecommendResources组件: 云函数调用异常:", error);
        throw error; // 重新抛出以便后续处理
      });

    if (!response) {
      console.error("RecommendResources组件: 云函数返回为空");
      recommendList.value = [];
      return;
    }

    console.log("RecommendResources组件: 云函数原始返回:", response);

    // uniCloud会将云函数返回值自动包装在result属性中
    const result = response.result;
    console.log("RecommendResources组件: 提取的result对象:", result);

    if (result && result.code === 200) {
      const resources = result.data || [];
      if (Array.isArray(resources)) {
        recommendList.value = resources;
        console.log(
          "RecommendResources组件: 成功获取推荐资源，数量:",
          recommendList.value.length
        );
      } else {
        console.error("RecommendResources组件: 返回数据不是数组:", resources);
        recommendList.value = [];
      }
    } else {
      const errorMsg = result?.msg || "未知错误";
      console.error("RecommendResources组件: 获取推荐资源失败:", errorMsg);
      recommendList.value = [];
    }
  } catch (error) {
    console.error("RecommendResources组件: 获取推荐资源异常:", error);
    recommendList.value = [];
    // 显示友好的错误提示
    uni.showToast({
      title: "加载推荐资源失败，请稍后再试",
      icon: "none",
      duration: 2000,
    });
  } finally {
    console.log("RecommendResources组件: 请求完成，重置loading状态");
    loading.value = false;
  }
};

// 强制刷新函数，用于外部事件触发刷新
const refreshData = () => {
  console.log("RecommendResources组件: 强制刷新数据");

  // 防止重复请求或正在进行的请求被中断
  if (loading.value) {
    console.log("RecommendResources组件: 已有请求正在进行，将在完成后刷新");
    // 设置一个标记，在当前请求完成后再次刷新
    setTimeout(() => {
      if (!loading.value) {
        console.log("RecommendResources组件: 延迟刷新执行");
        fetchRecommendedResources(true); // 使用强制刷新模式
      }
    }, 500);
    return;
  }

  // 正常刷新流程
  loading.value = true; // 设置加载状态
  recommendList.value = []; // 清空列表，显示加载状态

  console.log("RecommendResources组件: 立即刷新数据");
  // 使用setTimeout避免可能的UI阻塞
  setTimeout(() => {
    fetchRecommendedResources(true); // 使用强制刷新模式
  }, 100);
};

// 跳转到资源详情页
const goToDetail = (item) => {
  if (!item || !item._id) {
    console.error("RecommendResources组件: 资源ID不存在");
    return;
  }

  console.log("RecommendResources组件: 跳转到资源详情页:", item._id);

  // 跳转到资源详情页
  uni.navigateTo({
    url: `/pages/resource/detail?id=${item._id}`,
    fail: (err) => {
      console.error("RecommendResources组件: 详情页面跳转失败:", err);
      uni.showToast({
        title: "页面跳转失败",
        icon: "none",
      });
    },
  });
};

onMounted(() => {
  console.log("RecommendResources组件: mounted");
  loading.value = false; // 确保初始状态为 false
  fetchRecommendedResources();

  // 监听刷新事件，使用try-catch包装以避免错误中断流程
  uni.$on("refreshRecommendList", () => {
    try {
      console.log("RecommendResources组件: 收到刷新事件，立即刷新数据");
      // 清空当前列表，立即显示加载状态
      recommendList.value = [];

      // 短暂延迟后重新获取数据，确保云端数据已更新
      setTimeout(() => {
        try {
          // 使用强制刷新模式，确保能绕过loading状态检查
          fetchRecommendedResources(true);
        } catch (error) {
          console.error("RecommendResources组件: 刷新数据异常:", error);
          loading.value = false; // 确保加载状态被重置
        }
      }, 500);
    } catch (error) {
      console.error("RecommendResources组件: 处理刷新事件异常:", error);
      loading.value = false;
    }
  });
});

onUnmounted(() => {
  // 移除事件监听
  uni.$off("refreshRecommendList");
});

// 页面显示时刷新数据
onShow(() => {
  try {
    console.log("RecommendResources组件: onShow触发");

    // 检查全局状态中是否有更新标记
    const app = getApp();
    if (app.globalData && app.globalData.recommendUpdated) {
      console.log("RecommendResources组件: 检测到全局更新标记，主动刷新数据");
      app.globalData.recommendUpdated = false; // 重置标记
      refreshData();
      return;
    }

    // 检查是否从推荐管理页面返回
    const pages = getCurrentPages();
    if (pages && pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (
        prevPage?.route &&
        (prevPage.route.includes("admin/recommend") ||
          prevPage.route.includes("admin/edit"))
      ) {
        console.log("RecommendResources组件: 从管理页面返回，强制刷新数据");
        // 使用强制刷新模式，确保能绕过loading状态检查
        fetchRecommendedResources(true);
        return;
      }
    }

    // 默认每次显示页面时都刷新推荐资源数据
    console.log("RecommendResources组件: 页面显示，主动刷新数据");
    refreshData();
  } catch (error) {
    console.error("RecommendResources组件: onShow生命周期异常:", error);
    // 确保加载状态被重置
    loading.value = false;
  }
});

// 获取分类名称
const getCategoryName = (type) => {
  const categories = {
    tv: "电视剧",
    movie: "电影",
    software: "软件",
    book: "小说",
    shortvideo: "短剧",
    anime: "动漫",
    variety: "综艺",
    usatv: "美剧",
    comic: "漫画",
    koreatv: "韩剧",
    music: "音乐",
  };

  return categories[type] || "其他";
};

// 对外暴露方法
defineExpose({
  fetchRecommendedResources,
  refreshData,
});
</script>

<template>
  <view class="recommend-resources">
    <view class="section-header">
      <text class="section-title">推荐资源</text>
      <navigator url="/pages/category/allCategories" class="more-link">
        查看更多 <text class="iconfont icon-arrow-right"></text>
      </navigator>
    </view>

    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>

    <view v-else-if="recommendList.length === 0" class="empty">
      <text class="empty-text">暂无推荐资源</text>
    </view>

    <view v-else class="resources-grid">
      <view
        v-for="item in recommendList"
        :key="item._id"
        class="resource-card"
        @click="goToDetail(item)"
      >
        <image
          class="resource-image"
          :src="item.cover || '/static/images/default-cover.png'"
          mode="aspectFill"
        />
        <view class="resource-info">
          <text class="resource-title">{{ item.title }}</text>
          <view class="resource-meta">
            <text class="category">{{
              getCategoryName(item.resourceType)
            }}</text>
            <text class="view-count">{{ item.viewCount || 0 }}浏览</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.recommend-resources {
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 34rpx;
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
        height: 32rpx;
        background-color: #007aff;
        border-radius: 4rpx;
      }
    }

    .more-link {
      font-size: 26rpx;
      color: #666;
      display: flex;
      align-items: center;
    }
  }

  .loading,
  .empty {
    padding: 60rpx 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .empty-text {
      color: #999;
      font-size: 28rpx;
    }
  }

  .resources-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .resource-card {
      background-color: #f8f8f8;
      border-radius: 8rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

      .resource-image {
        width: 100%;
        height: 200rpx;
      }

      .resource-info {
        padding: 16rpx;

        .resource-title {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-bottom: 10rpx;
        }

        .resource-meta {
          display: flex;
          justify-content: space-between;
          font-size: 24rpx;
          color: #999;

          .category {
            background-color: #e6f7ff;
            color: #007aff;
            padding: 2rpx 10rpx;
            border-radius: 4rpx;
          }
        }
      }
    }
  }
}
</style> 