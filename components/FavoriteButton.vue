<template>
  <view class="favorite-btn" @click="toggleFavorite">
    <text
      class="iconfont"
      :class="isFavorite ? 'icon-star-filled' : 'icon-star'"
    ></text>
    <text>{{ isFavorite ? "已收藏" : "收藏" }}</text>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  resourceId: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  cover: String,
  link: String,
});

const isFavorite = ref(false);
const userInfo = ref(null);

// 检查用户是否登录
const checkUserLogin = () => {
  const storedUserInfo = uni.getStorageSync("userInfo");

  if (storedUserInfo && storedUserInfo._id) {
    userInfo.value = storedUserInfo;
    return true;
  }
  console.log("用户未登录或信息不完整");
  return false;
};

// 检查是否已收藏
const checkFavoriteStatus = async () => {
  if (!checkUserLogin()) {
    console.log("未登录，跳过收藏状态检查");
    return;
  }

  if (!userInfo.value || !userInfo.value._id) {
    console.error("用户信息不完整，无法检查收藏状态");
    return;
  }

  try {
    const { result } = await uniCloud.callFunction({
      name: "favorites",
      data: {
        action: "check",
        data: {
          userId: userInfo.value._id,
          resourceId: props.resourceId,
        },
      },
    });

    if (result.code === 200) {
      isFavorite.value = result.data;
    }
  } catch (e) {
    console.error("检查收藏状态失败", e);
  }
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!checkUserLogin()) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });

    uni.navigateTo({
      url:
        "/pages/login/login?redirect=favorite&resourceId=" + props.resourceId,
      success: () => {},
      fail: (err) => {
        console.error("导航到登录页失败:", err);
      },
    });
    return;
  }

  if (!userInfo.value || !userInfo.value._id) {
    console.error("用户信息不完整");
    uni.showToast({
      title: "用户信息不完整，请重新登录",
      icon: "none",
    });

    // 清除存储的用户信息并跳转到登录页
    uni.removeStorageSync("userInfo");
    uni.navigateTo({
      url: "/pages/login/login",
    });
    return;
  }

  try {
    const action = isFavorite.value ? "remove" : "add";

    // 如果是添加收藏，先检查资源是否存在
    if (action === "add") {
      // 验证资源是否存在
      const resourceCheck = await checkResourceExists(props.resourceId);
      if (!resourceCheck) {
        uni.showToast({
          title: "该资源已不存在",
          icon: "none",
        });
        return;
      }
    }

    // 构建请求数据
    let requestData = {
      userId: userInfo.value._id,
      resourceId: props.resourceId,
    };

    // 添加操作需要额外参数
    if (action === "add") {
      requestData = {
        ...requestData,
        title: props.title || "",
        description: props.description || "",
        cover: props.cover || "",
        link: props.link || "",
      };
    }

    // 最终检查必要参数
    if (!requestData.userId) {
      throw new Error("用户ID不能为空");
    }

    if (!requestData.resourceId) {
      throw new Error("资源ID不能为空");
    }

    const { result } = await uniCloud.callFunction({
      name: "favorites",
      data: {
        action,
        data: requestData,
      },
    });

    if (result.code === 200) {
      isFavorite.value = !isFavorite.value;
      uni.showToast({
        title: isFavorite.value ? "收藏成功" : "已取消收藏",
        icon: "success",
      });
    } else {
      uni.showToast({
        title: result.message || "操作失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("收藏操作异常:", e);
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  }
};

// 检查资源是否存在
const checkResourceExists = async (resourceId) => {
  if (!resourceId) return false;

  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "detail",
        data: { id: resourceId },
      },
    });

    return result.code === 200 && result.data;
  } catch (e) {
    console.error("检查资源是否存在失败:", e);
    return false;
  }
};

// 监听resourceId变化，重新检查收藏状态
watch(
  () => props.resourceId,
  (newVal) => {
    if (newVal) {
      checkFavoriteStatus();
    }
  }
);

onMounted(() => {
  checkFavoriteStatus();
});
</script>

<style lang="scss">
.favorite-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  cursor: pointer;

  .iconfont {
    margin-right: 10rpx;
    font-size: 32rpx;
  }

  .icon-star-filled {
    color: #f0ad4e;
  }

  .icon-star {
    color: #999;
  }
}
</style> 