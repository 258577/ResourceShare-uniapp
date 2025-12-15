<template>
  <view class="container">
    <view class="resource-detail" v-if="resource">
      <image :src="resource.cover" mode="aspectFill" class="cover"></image>

      <view class="header">
        <text class="title">{{ resource.title }}</text>
        <view class="actions">
          <!-- 使用收藏按钮组件 -->
          <favorite-button
            :resourceId="resource._id"
            :title="resource.title"
            :description="resource.description"
            :cover="resource.cover"
            :link="resource.link"
          ></favorite-button>
        </view>
      </view>

      <view class="info">
        <view class="stats">
          <text>收藏数: {{ resource.favoriteCount || 0 }}</text>
          <text>浏览数: {{ resource.viewCount || 0 }}</text>
        </view>
        <text class="desc">简介：{{ resource.description }}</text>

        <!-- 资源链接区域 -->
        <view class="link-section" @click="viewResource">
          <text class="link-text">点击观看</text>
          <text class="link-tip">将为您跳转到资源链接</text>
        </view>
      </view>

      <!-- 资源内容 -->
      <rich-text :nodes="resource.content" v-if="resource.content"></rich-text>
    </view>

    <view class="loading" v-else>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import FavoriteButton from "@/components/FavoriteButton.vue";
import { onLoad } from "@dcloudio/uni-app";

const resource = ref(null);

// 获取资源详情
const getResourceDetail = async (id) => {
  if (!id) {
    console.error("资源ID为空，无法获取详情");
    uni.showToast({
      title: "资源ID不能为空",
      icon: "none",
    });
    return;
  }

  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "detail",
        data: { id },
      },
    });

    if (result.code === 200) {
      resource.value = result.data;
    } else if (result.code === 404) {
      // 资源不存在的情况
      showResourceNotExist();
    } else {
      uni.showToast({
        title: result.message || "获取资源详情失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("资源详情异常:", e);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  }
};

// 显示资源不存在的提示
const showResourceNotExist = () => {
  resource.value = null;
  uni.showToast({
    title: "该资源已被删除或不存在",
    icon: "none",
    duration: 2000,
  });

  // 2秒后返回上一页
  setTimeout(() => {
    uni.navigateBack();
  }, 2000);
};

// 查看资源
const viewResource = () => {
  if (resource.value && resource.value.link) {
    // 确保资源ID存在
    if (!resource.value._id) {
      console.error("资源ID为空，无法增加浏览计数");
      return;
    }

    // 增加浏览计数
    uniCloud
      .callFunction({
        name: "resources",
        data: {
          action: "incrementView",
          data: { id: resource.value._id },
        },
      })
      .then(({ result }) => {
        if (result.code !== 200) {
          console.error("浏览计数返回错误:", result.msg);
        }
      })
      .catch((err) => {
        console.error("浏览计数错误:", err);
      });

    // 跳转到资源链接
    uni.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(
        resource.value.link
      )}`,
    });
  } else {
    console.error("资源或链接不存在:", resource.value);
    uni.showToast({
      title: "资源链接不存在",
      icon: "none",
    });
  }
};

// 页面加载时直接从options参数中获取资源ID
onLoad((options) => {
  // 直接从页面参数中获取资源ID
  if (options && options.id) {
    getResourceDetail(options.id);
  } else {
    uni.showToast({
      title: "未能获取资源信息",
      icon: "none",
    });
  }
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;

  .resource-detail {
    background-color: #fff;
    border-radius: 10rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

    .cover {
      width: 100%;
      height: 400rpx;
    }

    .header {
      padding: 20rpx;
      border-bottom: 1rpx solid #eee;

      .title {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
        display: block;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }
    }

    .info {
      padding: 20rpx;

      .stats {
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 26rpx;
        margin-bottom: 20rpx;
      }

      .desc {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 30rpx;
        display: block;
      }

      .link-section {
        margin: 30rpx 0;
        background-color: #007aff;
        border-radius: 10rpx;
        color: #fff;
        padding: 25rpx 0;
        text-align: center;
        display: flex;
        flex-direction: column;

        .link-text {
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }

        .link-tip {
          font-size: 24rpx;
          opacity: 0.8;
        }
      }
    }

    rich-text {
      padding: 0 20rpx 30rpx;
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100rpx 0;
    color: #999;
  }
}
</style> 