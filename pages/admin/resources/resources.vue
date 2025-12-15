<template>
  <view class="container">
    <view class="header">
      <text class="title">资源管理</text>
      <button type="primary" size="mini" @click="goToAdd">添加资源</button>
    </view>

    <view class="resource-list">
      <view class="resource-item" v-for="item in resourceList" :key="item._id">
        <image :src="item.cover" mode="aspectFill"></image>
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.description }}</text>
          <view class="stats">
            <text>收藏: {{ item.favoriteCount || 0 }}</text>
            <text>浏览: {{ item.viewCount || 0 }}</text>
            <text class="recommended" v-if="item.recommended">已推荐</text>
          </view>
          <view class="actions">
            <button size="mini" type="default" @click="handleEdit(item)">
              编辑
            </button>
            <button
              size="mini"
              :type="item.recommended ? 'default' : 'primary'"
              @click="handleToggleRecommended(item)"
            >
              {{ item.recommended ? "取消推荐" : "推荐" }}
            </button>
            <button size="mini" type="warn" @click="handleDelete(item._id)">
              删除
            </button>
          </view>
        </view>
      </view>

      <view class="empty" v-if="resourceList.length === 0">
        <text>暂无资源数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const resourceList = ref([]);
const isAdmin = ref(false);

// 检查管理员权限
const checkAdminPermission = () => {
  const userInfo = uni.getStorageSync("userInfo");
  if (userInfo && userInfo.role === "admin") {
    isAdmin.value = true;
    return true;
  }

  uni.showToast({
    title: "无管理员权限",
    icon: "none",
  });

  setTimeout(() => {
    uni.switchTab({
      url: "/pages/index/index",
    });
  }, 1500);

  return false;
};

// 获取资源列表
const getResourceList = async () => {
  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "list",
        data: {
          page: 1,
          pageSize: 100,
        },
      },
    });

    if (result.code === 200) {
      resourceList.value = result.data.list || [];
    } else {
      uni.showToast({
        title: result.message || "获取资源列表失败",
        icon: "none",
      });
    }
  } catch (e) {
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  }
};

// 跳转到添加资源页面
const goToAdd = () => {
  uni.navigateTo({
    url: "/pages/admin/resource-edit",
  });
};

// 编辑资源
const handleEdit = (item) => {
  uni.navigateTo({
    url: "/pages/admin/resource-edit",
    success: (res) => {
      res.eventChannel.emit("resourceData", item);
    },
  });
};

// 删除资源
const handleDelete = (id) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该资源吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const { result } = await uniCloud.callFunction({
            name: "resources",
            data: {
              action: "delete",
              data: { id },
            },
          });

          if (result.code === 200) {
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
            getResourceList();
          } else {
            uni.showToast({
              title: result.message || "删除失败",
              icon: "none",
            });
          }
        } catch (e) {
          uni.showToast({
            title: "操作失败",
            icon: "none",
          });
        }
      }
    },
  });
};

// 推荐/取消推荐资源
const handleToggleRecommended = async (item) => {
  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "setRecommended",
        data: {
          _id: item._id,
          recommended: !item.recommended,
        },
        userInfo: uni.getStorageSync("userInfo"),
      },
    });

    if (result.code === 200) {
      uni.showToast({
        title: item.recommended ? "已取消推荐" : "已设为推荐",
        icon: "success",
      });
      // 刷新列表
      getResourceList();
    } else {
      uni.showToast({
        title: result.message || "操作失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("设置推荐状态失败:", e);
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  }
};

onMounted(() => {
  if (checkAdminPermission()) {
    getResourceList();
  }
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
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
        width: 220rpx;
        height: 220rpx;
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
          margin-bottom: 20rpx;
          display: block;
        }

        .stats {
          display: flex;
          font-size: 24rpx;
          color: #999;
          margin-bottom: 20rpx;

          text {
            margin-right: 30rpx;
          }

          .recommended {
            color: #007aff;
            background-color: rgba(0, 122, 255, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
          }
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 20rpx;
        }
      }
    }

    .empty {
      text-align: center;
      padding: 100rpx 0;
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style> 