<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">资源编辑</text>
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
        <view class="action-btns">
          <button size="mini" type="primary" @click="editResource(item)">
            编辑
          </button>
          <button size="mini" type="warn" @click="deleteResource(item)">
            删除
          </button>
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

    <!-- 编辑弹窗 -->
    <view class="custom-popup" v-if="showEditPopup">
      <view class="custom-popup-mask" @click="closeEditPopup"></view>
      <view class="custom-popup-content">
        <view class="custom-popup-header">
          <text class="custom-popup-title">编辑资源</text>
          <text class="custom-popup-close" @click="closeEditPopup">×</text>
        </view>
        <view class="custom-popup-body">
          <view class="custom-form-item">
            <text class="custom-form-label">资源标题</text>
            <input
              class="custom-form-input"
              type="text"
              v-model="editForm.title"
              placeholder="请输入资源标题"
            />
          </view>
          <view class="custom-form-item">
            <text class="custom-form-label">资源类型</text>
            <view class="type-selection">
              <view
                v-for="(item, index) in typeOptions"
                :key="index"
                class="type-item"
                :class="{ active: editForm.resourceType === item.value }"
                @click="editForm.resourceType = item.value"
              >
                <text>{{ item.name }}</text>
              </view>
            </view>
          </view>
          <view class="custom-form-item">
            <text class="custom-form-label">资源链接</text>
            <input
              class="custom-form-input"
              type="text"
              v-model="editForm.link"
              placeholder="请输入资源链接"
            />
          </view>
          <view class="custom-form-item">
            <text class="custom-form-label">资源简介</text>
            <textarea
              class="custom-form-textarea"
              v-model="editForm.description"
              placeholder="请输入资源简介"
              maxlength="-1"
            />
          </view>
        </view>
        <view class="custom-popup-footer">
          <button class="custom-btn custom-cancel-btn" @click="closeEditPopup">
            取消
          </button>
          <button class="custom-btn custom-confirm-btn" @click="confirmEdit">
            确定
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";

// 资源列表数据
const resourceList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const showEditPopup = ref(false);

// 编辑表单数据
const editForm = ref({
  _id: "",
  title: "",
  resourceType: "",
  link: "",
  description: "",
});

// 资源类型选项
const typeOptions = [
  { name: "电视剧", value: "tv" },
  { name: "电影", value: "movie" },
  { name: "软件", value: "software" },
  { name: "小说", value: "book" },
  { name: "短剧", value: "shortvideo" },
  { name: "动漫", value: "anime" },
  { name: "综艺", value: "variety" },
  { name: "美剧", value: "usatv" },
  { name: "漫画", value: "comic" },
  { name: "韩剧", value: "koreatv" },
  { name: "音乐", value: "music" },
];

// 根据当前选择的资源类型计算类型索引
const typeIndex = computed(() => {
  const index = typeOptions.findIndex(
    (item) => item.value === editForm.value.resourceType
  );
  return index >= 0 ? index : 0;
});

// 获取分类名称
const getCategoryName = (type) => {
  const category = typeOptions.find((item) => item.value === type);
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

      if (currentPage.value === 1) {
        resourceList.value = result.data.list;
      } else {
        resourceList.value = [...resourceList.value, ...result.data.list];
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

// 编辑资源
const editResource = (item) => {
  // 复制资源数据到编辑表单
  editForm.value = {
    _id: item._id,
    title: item.title,
    resourceType: item.resourceType,
    link: item.link || "",
    description: item.description,
  };

  // 打开编辑弹窗
  showEditPopup.value = true;
};

// 处理类型选择变化
const handleTypeChange = (e) => {
  const index = e.detail.value;
  editForm.value.resourceType = typeOptions[index].value;
};

// 确认编辑
const confirmEdit = async () => {
  // 表单验证
  if (
    !editForm.value.title ||
    !editForm.value.resourceType ||
    !editForm.value.description
  ) {
    uni.showToast({
      title: "标题、类型和简介不能为空",
      icon: "none",
    });
    return;
  }

  // 验证链接格式
  if (editForm.value.link && !/(http|https):\/\//.test(editForm.value.link)) {
    uni.showToast({
      title: "链接必须以http://或https://开头",
      icon: "none",
    });
    return;
  }

  try {
    uni.showLoading({
      title: "保存中...",
    });

    // 获取用户信息
    const userInfo = uni.getStorageSync("userInfo");
    if (!userInfo || userInfo.role !== "admin") {
      uni.hideLoading();
      return uni.showToast({
        title: "无权限操作",
        icon: "none",
      });
    }

    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "update",
        data: {
          _id: editForm.value._id,
          title: editForm.value.title,
          resourceType: editForm.value.resourceType,
          link: editForm.value.link,
          description: editForm.value.description,
        },
        userInfo: userInfo, // 传递用户信息到云函数
      },
    });

    if (result.code === 200) {
      uni.showToast({
        title: "更新成功",
        icon: "success",
      });

      // 关闭弹窗
      showEditPopup.value = false;

      // 刷新资源列表
      handleSearch();

      // 通知首页刷新推荐资源列表
      try {
        // 设置全局标记
        const app = getApp();
        if (app.globalData) {
          app.globalData.recommendUpdated = true;
        } else {
          app.globalData = { recommendUpdated: true };
        }

        uni.$emit("refreshRecommendList");
        console.log("已发出刷新首页推荐资源的通知");
      } catch (emitError) {
        console.error("发送刷新事件失败:", emitError);
      }
    } else {
      throw new Error(result.msg || "更新失败");
    }
  } catch (err) {
    uni.showToast({
      title: err.message || "更新失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 关闭编辑弹窗
const closeEditPopup = () => {
  showEditPopup.value = false;
};

// 删除资源
const deleteResource = (item) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该资源吗？此操作无法撤销。",
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: "删除中...",
          });

          // 获取用户信息
          const userInfo = uni.getStorageSync("userInfo");

          const { result } = await uniCloud.callFunction({
            name: "resources",
            data: {
              action: "remove",
              data: {
                _id: item._id,
              },
              userInfo: userInfo, // 传递用户信息到云函数
            },
          });

          if (result.code === 200) {
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });

            // 刷新资源列表
            handleSearch();

            // 通知首页刷新推荐资源列表
            uni.$emit("refreshRecommendList");
            console.log("已发出刷新首页推荐资源的通知");
          } else {
            throw new Error(result.msg || "删除失败");
          }
        } catch (err) {
          uni.showToast({
            title: err.message || "删除失败",
            icon: "none",
          });
        } finally {
          uni.hideLoading();
        }
      }
    },
  });
};

// 返回上一页
const goBack = () => {
  console.log("退出资源编辑页面，发送刷新事件");

  // 设置全局标记，确保首页能检测到并刷新
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
  console.log("资源编辑页面卸载，发送刷新事件");
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
        height: 180rpx;
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

      .action-btns {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20rpx;
        gap: 10rpx;
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

  .custom-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s ease-in-out;

    .custom-popup-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .custom-popup-content {
      background-color: #fff;
      border-radius: 12rpx;
      width: 85%;
      max-width: 600rpx;
      max-height: 80vh;
      padding: 25rpx;
      position: relative;
      z-index: 1000;
      animation: scaleIn 0.2s ease-in-out;
      box-shadow: 0 6rpx 30rpx rgba(0, 0, 0, 0.15);
      overflow-y: auto;
      display: flex;
      flex-direction: column;

      .custom-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;
        padding-bottom: 15rpx;
        border-bottom: 1px solid #f0f0f0;

        .custom-popup-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }

        .custom-popup-close {
          font-size: 40rpx;
          color: #999;
          cursor: pointer;
          width: 40rpx;
          height: 40rpx;
          line-height: 36rpx;
          text-align: center;
        }
      }

      .custom-popup-body {
        .custom-form-item {
          margin-bottom: 20rpx;

          .custom-form-label {
            display: block;
            font-size: 28rpx;
            color: #333;
            margin-bottom: 10rpx;
          }

          .custom-form-input,
          .custom-form-textarea {
            width: 100%;
            height: 70rpx;
            border: 1px solid #eee;
            border-radius: 8rpx;
            padding: 0 20rpx;
            font-size: 28rpx;
            background-color: #f9f9f9;
            box-sizing: border-box;
          }

          .custom-form-textarea {
            height: 120rpx;
            padding: 15rpx;
            resize: none;
          }

          .type-selection {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -5rpx;

            .type-item {
              padding: 6rpx 15rpx;
              margin: 0 5rpx 10rpx;
              background-color: #f5f5f5;
              border-radius: 30rpx;
              font-size: 24rpx;
              color: #666;

              &.active {
                background-color: #007aff;
                color: #fff;
              }
            }
          }
        }
      }

      .custom-popup-footer {
        display: flex;
        justify-content: flex-end;
        padding-top: 20rpx;
        margin-top: 10rpx;
        border-top: 1px solid #f0f0f0;

        .custom-btn {
          padding: 8rpx 25rpx;
          border-radius: 30rpx;
          font-size: 26rpx;
          margin-left: 20rpx;
        }

        .custom-cancel-btn {
          background-color: #f0f0f0;
          color: #666;
        }

        .custom-confirm-btn {
          background-color: #007aff;
          color: #fff;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
