<template>
  <view class="container">
    <!-- 未登录提示 -->
    <view class="not-login" v-if="!userInfo">
      <text>请先登录后查看收藏</text>
      <button type="primary" @click="goLogin">去登录</button>
    </view>

    <!-- 收藏列表 -->
    <scroll-view
      scroll-y="true"
      class="favorite-list"
      v-else
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="empty" v-if="favoriteList.length === 0">
        <text>暂无收藏内容</text>
      </view>

      <view
        class="resource-item"
        v-for="(item, index) in favoriteList"
        :key="index"
      >
        <image :src="item.cover" mode="aspectFill"></image>
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.description }}</text>
          <text class="time">收藏时间: {{ formatDate(item.createTime) }}</text>
          <view class="actions">
            <button size="mini" type="warn" @click="handleUnfavorite(index)">
              取消收藏
            </button>
            <button size="mini" type="primary" @click="handleView(item)">
              查看
            </button>
          </view>
        </view>
      </view>

      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";

// 数据定义
const userInfo = ref(null);
const favoriteList = ref([]);
const refreshing = ref(false);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);

// 方法定义
const getUserInfo = () => {
  const storedUserInfo = uni.getStorageSync("userInfo");
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

  if (!hasMore.value && !isRefresh) return;

  loading.value = true;

  try {
    const { result } = await uniCloud.callFunction({
      name: "favorites",
      data: {
        action: "list",
        data: {
          userId: userInfo.value._id,
          page: page.value,
          pageSize: pageSize.value,
        },
      },
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
    uni.showToast({
      title: "获取收藏失败",
      icon: "none",
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
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const goLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

const handleUnfavorite = (index) => {
  uni.showModal({
    title: "提示",
    content: "确定取消收藏该资源吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const item = favoriteList.value[index];
          const { result } = await uniCloud.callFunction({
            name: "favorites",
            data: {
              action: "remove",
              data: {
                userId: userInfo.value._id,
                resourceId: item.resourceId,
              },
            },
          });

          if (result.code === 200) {
            uni.showToast({
              title: "已取消收藏",
              icon: "success",
            });
            // 更新列表
            favoriteList.value.splice(index, 1);
          } else {
            uni.showToast({
              title: result.message || "操作失败",
              icon: "none",
            });
          }
        } catch (e) {
          console.error(e);
          uni.showToast({
            title: "操作失败",
            icon: "none",
          });
        }
      }
    },
  });
};

const handleView = async (item) => {
  // 首先检查资源是否存在
  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "detail",
        data: { id: item.resourceId },
      },
    });

    if (result.code === 200) {
      // 资源存在，跳转到详情页
      uni.navigateTo({
        url: `/pages/resource/detail?id=${item.resourceId}`,
      });
    } else {
      // 资源不存在
      uni.showToast({
        title: "该资源已不存在",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (e) {
    console.error("检查资源失败:", e);
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  }
};

// 生命周期
onMounted(() => {
  getUserInfo();
});

// 添加页面显示时的刷新逻辑
onShow(() => {
  if (userInfo.value) {
    getFavoriteList(true);
  }
});
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;

  .not-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    text {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 30rpx;
    }

    button {
      width: 200rpx;
    }
  }

  .favorite-list {
    height: calc(100vh - 40rpx);

    .empty {
      text-align: center;
      padding: 100rpx 0;
      color: #999;
      font-size: 28rpx;
    }

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
          display: block;
        }

        .desc {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 10rpx;
          display: block;
        }

        .time {
          font-size: 22rpx;
          color: #999;
          margin-bottom: 20rpx;
          display: block;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 20rpx;
        }
      }
    }

    .loading {
      text-align: center;
      padding: 20rpx;
      color: #999;
      font-size: 24rpx;
    }
  }
}
</style> 