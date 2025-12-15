<template>
  <view class="container">
    <!-- 未登录状态 -->
    <view class="not-login" v-if="!userInfo">
      <image class="avatar" src="/static/default-avatar.png"></image>
      <view class="login-btn" @click="goLogin">点击登录</view>
    </view>

    <!-- 已登录状态 -->
    <view class="user-info" v-else>
      <image
        class="avatar"
        :src="userInfo.avatarUrl || '/static/avatar.png'"
      ></image>
      <view class="info">
        <text class="nickname">{{ userInfo.nickName || "用户" }}</text>
        <text class="role">{{
          userInfo.role === "admin" ? "管理员" : "普通用户"
        }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <!-- 管理员功能 -->
      <view class="menu-group" v-if="userInfo && userInfo.role === 'admin'">
        <view class="menu-item" @click="goToBannerManage">
          <text>轮播图管理</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="goToResourceManage">
          <text>上传资源</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="goToResourceEdit">
          <text>资源编辑</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="goToRecommendManage">
          <text>首页推荐管理</text>
          <text class="arrow">></text>
        </view>
      </view>

      <!-- 普通用户功能 -->
      <view class="menu-group">
        <view class="menu-item" @click="goToFavorites">
          <text>我的收藏</text>
          <text class="arrow">></text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="menu-group" v-if="userInfo">
        <view class="menu-item" @click="handleLogout">
          <text>退出登录</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// 用户信息
const userInfo = ref(null);

// 页面显示时获取用户信息
onShow(() => {
  getUserInfo();
});

// 获取用户信息
const getUserInfo = () => {
  const storedUserInfo = uni.getStorageSync("userInfo");
  if (storedUserInfo) {
    userInfo.value = storedUserInfo;
  }
};

// 跳转到登录页
const goLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};

// 跳转到轮播图管理
const goToBannerManage = () => {
  uni.navigateTo({
    url: "/pages/admin/banners/banners",
  });
};

// 跳转到资源管理
const goToResourceManage = () => {
  uni.navigateTo({
    url: "/pages/admin/upload/upload",
  });
};

// 跳转到资源编辑
const goToResourceEdit = () => {
  uni.navigateTo({
    url: "/pages/admin/edit/edit",
  });
};

// 跳转到首页推荐管理
const goToRecommendManage = () => {
  uni.navigateTo({
    url: "/pages/admin/recommend/recommend",
  });
};

// 跳转到收藏页
const goToFavorites = () => {
  uni.switchTab({
    url: "/pages/favorite/favorite",
  });
};

// 退出登录
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
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;

  .not-login,
  .user-info {
    display: flex;
    align-items: center;
    padding: 40rpx;
    background-color: #fff;
    margin-bottom: 20rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 30rpx;
    }

    .info {
      .nickname {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
        display: block;
      }

      .role {
        font-size: 24rpx;
        color: #666;
      }
    }

    .login-btn {
      font-size: 32rpx;
      color: #007aff;
    }
  }

  .menu-list {
    .menu-group {
      background-color: #fff;
      margin-bottom: 20rpx;

      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        text {
          font-size: 28rpx;
          color: #333;

          &.arrow {
            color: #999;
          }
        }
      }
    }
  }
}
</style> 