<template>
  <view class="login-container">
    <view class="login-box">
      <view class="title">登录</view>

      <!-- 管理员登录表单 -->
      <view class="admin-login" v-if="!isWechatLogin">
        <input
          type="text"
          v-model="adminForm.username"
          placeholder="请输入管理员账号"
        />
        <input
          type="password"
          v-model="adminForm.password"
          placeholder="请输入密码"
        />
        <button @click="handleAdminLogin">管理员登录</button>
      </view>

      <!-- 微信登录按钮 -->
      <view class="wechat-login">
        <button type="primary" @click="handleWechatLogin">微信一键登录</button>
      </view>

      <!-- 切换登录方式 -->
      <view class="switch-login" @click="switchLoginType">
        {{ isWechatLogin ? "管理员登录" : "微信登录" }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 数据定义
const isWechatLogin = ref(true);
const adminForm = ref({
  username: "",
  password: "",
});

// 重定向参数
const redirect = ref("");
const resourceId = ref("");

// 获取URL参数
onMounted(() => {
  const query = uni.getEnterOptionsSync().query;
  if (query) {
    redirect.value = query.redirect || "";
    resourceId.value = query.resourceId || "";
  }
});

// 登录成功后的跳转处理
const navigateAfterLogin = () => {
  if (redirect.value === "favorite" && resourceId.value) {
    uni.navigateTo({
      url: `/pages/resource/detail?id=${resourceId.value}`,
    });
  } else {
    // 默认跳转到我的页面
    uni.switchTab({
      url: "/pages/my/my",
    });
  }
};

// 方法定义
const switchLoginType = () => {
  isWechatLogin.value = !isWechatLogin.value;
};

const handleAdminLogin = () => {
  if (
    adminForm.value.username === "admin" &&
    adminForm.value.password === "admin"
  ) {
    uni.setStorageSync("userInfo", {
      _id: "admin_" + Date.now(), // 添加一个唯一ID
      role: "admin",
      username: "admin",
    });
    uni.showToast({
      title: "登录成功",
      icon: "success",
    });
    setTimeout(() => {
      navigateAfterLogin();
    }, 1500);
  } else {
    uni.showToast({
      title: "账号或密码错误",
      icon: "none",
    });
  }
};

const handleWechatLogin = () => {
  // 模拟微信登录
  const mockUserInfo = {
    _id: "user_" + Date.now(), // 添加唯一ID
    nickname: "用户" + Math.floor(Math.random() * 1000),
    avatarUrl: "",
    role: "user",
  };

  uni.setStorageSync("userInfo", mockUserInfo);

  uni.showToast({
    title: "登录成功",
    icon: "success",
  });

  setTimeout(() => {
    navigateAfterLogin();
  }, 1500);
};
</script>

<style lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;

  .login-box {
    width: 80%;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);

    .title {
      font-size: 40rpx;
      text-align: center;
      margin-bottom: 40rpx;
    }

    input {
      width: 100%;
      height: 80rpx;
      border: 1px solid #ddd;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
      padding: 0 20rpx;
    }

    button {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      margin-bottom: 20rpx;
    }

    .switch-login {
      text-align: center;
      color: #007aff;
      font-size: 28rpx;
    }
  }
}
</style> 