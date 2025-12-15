<template>
  <view class="container">
    <web-view :src="url" @message="handleMessage"></web-view>
    <view class="copy-link" @click="handleCopyLink">
      <text class="iconfont icon-copy"></text>
      <text>复制链接</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const url = ref("");

const handleMessage = (event) => {
  console.log("WebView message:", event);
};

const handleCopyLink = () => {
  uni.setClipboardData({
    data: url.value,
    success: () => {
      uni.showToast({
        title: "链接已复制",
        icon: "success",
      });
    },
  });
};

// 页面加载时获取URL参数
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options || currentPage.options;

  if (options && options.url) {
    url.value = decodeURIComponent(options.url);
  }
});
</script>

<style lang="scss">
.container {
  position: relative;
  width: 100%;
  height: 100vh;

  .copy-link {
    position: fixed;
    bottom: 50rpx;
    right: 50rpx;
    background-color: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 20rpx 30rpx;
    border-radius: 50rpx;
    display: flex;
    align-items: center;

    .icon-copy {
      margin-right: 10rpx;
    }
  }
}
</style> 