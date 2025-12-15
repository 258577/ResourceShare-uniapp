<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">首页推荐管理</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-box">
      <text class="iconfont icon-search"></text>
      <input
        type="text"
        v-model="searchKeyword"
        class="search-input"
        placeholder="搜索资源名称"
        confirm-type="search"
        @confirm="handleSearch"
      />
      <text class="search-btn" @click="handleSearch">搜索</text>
    </view>

    <!-- 资源列表 -->
    <view class="resource-list" v-if="resourceList.length > 0">
      <view
        class="resource-item"
        v-for="(item, index) in resourceList"
        :key="index"
      >
        <image
          :src="item.cover"
          mode="aspectFill"
          class="resource-cover"
        ></image>
        <view class="resource-info">
          <text class="resource-title">{{ item.title }}</text>
          <text class="resource-type">{{
            getCategoryName(item.resourceType)
          }}</text>
          <text class="resource-desc">{{ item.description }}</text>
        </view>
        <view class="recommend-btn" @click="toggleRecommend(item)">
          <text :class="['btn-text', { recommended: item.isRecommended }]">
            {{ item.isRecommended ? "取消推荐" : "推荐" }}
          </text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-else-if="isLoading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-container" v-else>
      <text>暂无资源</text>
    </view>

    <!-- 加载更多 -->
    <view
      class="load-more"
      v-if="hasMore && resourceList.length > 0"
      @click="loadMore"
    >
      <text>加载更多</text>
    </view>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">返回</button>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 资源列表
const resourceList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);

// 资源类型
const categories = [
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
];

// 获取分类名称
const getCategoryName = (type) => {
  const category = categories.find((item) => item.type === type);
  return category ? category.name : "未知分类";
};

// 检查管理员权限
const checkAdmin = () => {
  const userInfo = uni.getStorageSync("userInfo");
  if (!userInfo || userInfo.role !== "admin") {
    uni.showToast({
      title: "无权限访问",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    return false;
  }
  return true;
};

// 搜索资源
const handleSearch = () => {
  currentPage.value = 1;
  hasMore.value = true;
  resourceList.value = [];
  fetchResources();
};

// 获取资源列表
const fetchResources = async () => {
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "list",
        data: {
          keyword: searchKeyword.value,
          page: currentPage.value,
          pageSize: pageSize.value,
        },
      },
    });

    if (result.code === 200) {
      if (result.data.list.length < pageSize.value) {
        hasMore.value = false;
      }

      // 处理资源列表，添加isRecommended属性
      const resourceListWithRecommendedStatus = result.data.list.map(
        (item) => ({
          ...item,
          isRecommended: !!item.recommended,
        })
      );

      if (currentPage.value === 1) {
        resourceList.value = resourceListWithRecommendedStatus;
      } else {
        resourceList.value = [
          ...resourceList.value,
          ...resourceListWithRecommendedStatus,
        ];
      }
    } else {
      uni.showToast({
        title: result.msg || "获取资源失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "获取资源失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!hasMore.value || isLoading.value) return;

  currentPage.value++;
  fetchResources();
};

// 切换推荐状态
const toggleRecommend = async (item) => {
  // 获取用户信息
  const userInfo = uni.getStorageSync("userInfo");
  if (!userInfo || userInfo.role !== "admin") {
    return uni.showToast({
      title: "无权限操作",
      icon: "none",
    });
  }

  // 在API调用之前先更新UI状态，提供即时反馈
  const originalState = item.isRecommended;
  item.isRecommended = !originalState;
  item.recommended = !originalState;

  uni.showLoading({
    title: originalState ? "取消推荐中..." : "推荐中...",
  });

  try {
    console.log(
      "切换推荐状态，资源ID:",
      item._id,
      "原始状态:",
      originalState,
      "目标状态:",
      !originalState
    );

    // 调用云函数
    const response = await uniCloud.callFunction({
      name: "recommend",
      data: {
        action: "toggleRecommend",
        data: {
          id: item._id,
          recommend: !originalState,
        },
        userInfo: userInfo,
      },
    });

    // 确保从响应中正确提取结果
    const result = response.result;
    console.log("云函数返回结果:", result);

    if (result && result.code === 200) {
      uni.showToast({
        title: result.msg || (!originalState ? "已推荐到首页" : "已取消推荐"),
        icon: "success",
      });

      // 通知首页刷新推荐列表 - 只使用事件通知
      try {
        console.log("发送refreshRecommendList事件，通知首页更新");
        uni.$emit("refreshRecommendList");
      } catch (emitError) {
        console.warn("发送刷新事件失败，但操作已成功:", emitError);
      }
    } else {
      // 如果API调用失败，恢复原始状态
      item.isRecommended = originalState;
      item.recommended = originalState;

      uni.showToast({
        title: result?.msg || "操作失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("推荐操作失败:", e);
    // 发生异常时，确保UI状态恢复原样
    item.isRecommended = originalState;
    item.recommended = originalState;

    // 避免显示具体的错误信息给用户
    uni.showToast({
      title: "网络异常，请重试",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 返回上一页
const goBack = () => {
  console.log("退出推荐管理页面，发送刷新事件");
  // 设置标记，指示推荐资源已更新
  const app = getApp();
  if (app.globalData) {
    app.globalData.recommendUpdated = true;
  } else {
    app.globalData = { recommendUpdated: true };
  }

  // 发送刷新事件
  try {
    uni.$emit("refreshRecommendList");
  } catch (error) {
    console.error("发送刷新事件失败:", error);
  }

  // 返回上一页
  uni.navigateBack();
};

// 生命周期钩子
onMounted(() => {
  if (checkAdmin()) {
    fetchResources();
  }
});

// 页面卸载时触发事件
onUnmounted(() => {
  console.log("推荐管理页面卸载，发送刷新事件");
  // 通知首页刷新推荐资源列表
  try {
    uni.$emit("refreshRecommendList");
  } catch (error) {
    console.error("页面卸载时发送刷新事件失败:", error);
  }
});
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  min-height: 100vh;
  background-color: #f5f5f5;

  .page-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 50rpx;
    padding: 10rpx 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

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

  .resource-list {
    .resource-item {
      display: flex;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 10rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

      .resource-cover {
        width: 160rpx;
        height: 160rpx;
        flex-shrink: 0;
      }

      .resource-info {
        flex: 1;
        padding: 20rpx;
        display: flex;
        flex-direction: column;

        .resource-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
        }

        .resource-type {
          font-size: 24rpx;
          color: #007aff;
          margin-bottom: 10rpx;
          background-color: rgba(0, 122, 255, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          display: inline-block;
          max-width: max-content;
        }

        .resource-desc {
          font-size: 26rpx;
          color: #666;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }

      .recommend-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 30rpx;

        .btn-text {
          padding: 10rpx 20rpx;
          font-size: 26rpx;
          background-color: #f0f0f0;
          color: #666;
          border-radius: 30rpx;

          &.recommended {
            background-color: #007aff;
            color: #fff;
          }
        }
      }
    }
  }

  .loading-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }

    text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .load-more {
    text-align: center;
    padding: 30rpx 0;
    color: #007aff;
    font-size: 28rpx;
  }

  .back-btn {
    margin-top: 30rpx;
    background-color: #f0f0f0;
    color: #666;
    border-radius: 50rpx;
    font-size: 30rpx;
  }
}
</style> 