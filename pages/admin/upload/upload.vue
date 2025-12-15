<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">资源上传管理</text>
    </view>

    <view class="form-item">
      <text class="label">资源类型</text>
      <picker
        @change="handleResourceTypeChange"
        :value="resourceTypeIndex"
        :range="resourceTypes"
        range-key="name"
      >
        <view class="picker-value">{{
          resourceTypes[resourceTypeIndex].name
        }}</view>
      </picker>
    </view>

    <view class="form-item" v-if="showSubTypes">
      <text class="label">子类型</text>
      <view class="checkbox-group">
        <checkbox-group @change="handleSubTypesChange">
          <label
            v-for="(item, index) in currentSubTypes"
            :key="index"
            class="checkbox-item"
          >
            <checkbox
              :value="item.type"
              :checked="selectedSubTypes.includes(item.type)"
            />
            <text>{{ item.name }}</text>
          </label>
        </checkbox-group>
      </view>
    </view>

    <view class="form-item">
      <text class="label">资源名称</text>
      <input
        class="input"
        type="text"
        v-model="title"
        placeholder="请输入资源名称"
      />
    </view>

    <view class="form-item">
      <text class="label">资源简介</text>
      <textarea
        class="textarea"
        v-model="description"
        placeholder="请输入资源简介"
      />
    </view>

    <view class="form-item">
      <text class="label">资源链接</text>
      <input
        class="input"
        type="text"
        v-model="link"
        placeholder="请输入资源链接"
      />
    </view>

    <view class="form-item">
      <text class="label">封面图片</text>
      <view class="cover-uploader" @click="handleCoverUpload" v-if="!cover">
        <text class="iconfont icon-add"></text>
        <text>点击上传封面</text>
      </view>
      <view class="cover-preview" v-else>
        <image :src="cover" mode="aspectFill"></image>
        <text class="delete-btn" @click.stop="handleDeleteCover">×</text>
      </view>
    </view>

    <button class="submit-btn" @click="handleSubmit">提交</button>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">返回上一页</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// 响应式状态
const resourceTypes = ref([
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
  { name: "更多", type: "more" },
]);
const resourceTypeIndex = ref(0);
const title = ref("");
const description = ref("");
const link = ref("");
const cover = ref("");
const selectedSubTypes = ref([]);

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

// 子类型映射
const subTypesMap = {
  tv: [
    { name: "都市", type: "urban" },
    { name: "家庭", type: "family" },
    { name: "爱情", type: "romance" },
    { name: "古装", type: "historical" },
    { name: "玄幻", type: "fantasy" },
    { name: "悬疑", type: "suspense" },
  ],
  movie: [
    { name: "爱情", type: "romance" },
    { name: "喜剧", type: "comedy" },
    { name: "奇幻", type: "fantasy" },
    { name: "青春", type: "youth" },
    { name: "恐怖", type: "horror" },
    { name: "动画", type: "animation" },
    { name: "科幻", type: "sci-fi" },
    { name: "动作", type: "action" },
    { name: "战争", type: "war" },
  ],
  software: [
    { name: "办公", type: "office" },
    { name: "编程", type: "programming" },
    { name: "图像图形", type: "graphics" },
    { name: "建模", type: "modeling" },
    { name: "社交", type: "social" },
  ],
  book: [
    { name: "言情", type: "romance" },
    { name: "耽美", type: "bl" },
    { name: "玄幻", type: "fantasy" },
    { name: "武侠", type: "martial" },
    { name: "悬疑", type: "suspense" },
    { name: "科幻", type: "sci-fi" },
    { name: "历史", type: "historical" },
  ],
  comic: [
    { name: "古代", type: "ancient" },
    { name: "现代", type: "modern" },
    { name: "玄幻", type: "fantasy" },
  ],
  koreatv: [
    { name: "都市", type: "urban" },
    { name: "爱情", type: "romance" },
    { name: "悬疑", type: "suspense" },
    { name: "校园", type: "campus" },
    { name: "古装", type: "historical" },
    { name: "职场", type: "workplace" },
  ],
  music: [
    { name: "流行", type: "pop" },
    { name: "欧美", type: "western" },
    { name: "粤语", type: "cantonese" },
  ],
};

// 计算属性
const currentResourceType = computed(() => {
  return resourceTypes.value[resourceTypeIndex.value].type;
});

const showSubTypes = computed(() => {
  return !!subTypesMap[currentResourceType.value];
});

const currentSubTypes = computed(() => {
  return subTypesMap[currentResourceType.value] || [];
});

// 方法
const handleResourceTypeChange = (e) => {
  resourceTypeIndex.value = e.detail.value;
  selectedSubTypes.value = [];
};

const handleSubTypesChange = (e) => {
  selectedSubTypes.value = e.detail.value;
};

const handleCoverUpload = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      uni.showLoading({
        title: "上传中...",
      });

      const tempFilePath = res.tempFilePaths[0];

      // 上传到云存储
      uniCloud.uploadFile({
        filePath: tempFilePath,
        cloudPath: `resources/${Date.now()}-${Math.random()
          .toString(36)
          .slice(-6)}.jpg`,
        success: (res) => {
          cover.value = res.fileID;
          uni.hideLoading();
        },
        fail: (err) => {
          console.error(err);
          uni.showToast({
            title: "上传失败",
            icon: "none",
          });
          uni.hideLoading();
        },
      });
    },
  });
};

const handleDeleteCover = () => {
  cover.value = "";
};

const handleSubmit = () => {
  // 表单验证
  if (!title.value) {
    return uni.showToast({
      title: "请输入资源名称",
      icon: "none",
    });
  }

  if (!description.value) {
    return uni.showToast({
      title: "请输入资源简介",
      icon: "none",
    });
  }

  if (!link.value) {
    return uni.showToast({
      title: "请输入资源链接",
      icon: "none",
    });
  }

  if (!cover.value) {
    return uni.showToast({
      title: "请上传封面图片",
      icon: "none",
    });
  }

  // 获取用户信息
  const userInfo = uni.getStorageSync("userInfo");
  if (!userInfo || userInfo.role !== "admin") {
    return uni.showToast({
      title: "无权限操作",
      icon: "none",
    });
  }

  // 提交数据
  uni.showLoading({
    title: "提交中...",
  });

  uniCloud
    .callFunction({
      name: "resources",
      data: {
        action: "add",
        userInfo: userInfo,
        data: {
          resourceType: currentResourceType.value,
          types: selectedSubTypes.value,
          title: title.value,
          description: description.value,
          link: link.value,
          cover: cover.value,
          createTime: new Date().getTime(),
        },
      },
    })
    .then((res) => {
      const { result } = res;
      if (result.code === 200) {
        uni.showToast({
          title: "添加成功",
          icon: "success",
        });

        // 重置表单
        resourceTypeIndex.value = 0;
        title.value = "";
        description.value = "";
        link.value = "";
        cover.value = "";
        selectedSubTypes.value = [];
      } else {
        throw new Error(result.msg || "添加失败");
      }
    })
    .catch((err) => {
      console.error(err);
      uni.showToast({
        title: err.message || "添加失败",
        icon: "none",
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 生命周期钩子
onMounted(() => {
  checkAdmin();
});
</script>

<style lang="scss">
.container {
  padding: 30rpx;

  .page-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .form-item {
    margin-bottom: 30rpx;

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 15rpx;
    }

    .input,
    .picker-value {
      width: 100%;
      height: 80rpx;
      border: 1px solid #eee;
      border-radius: 10rpx;
      background-color: #f8f8f8;
      padding: 0 20rpx;
      font-size: 28rpx;
      color: #333;
      line-height: 80rpx;
    }

    .textarea {
      width: 100%;
      height: 200rpx;
      border: 1px solid #eee;
      border-radius: 10rpx;
      background-color: #f8f8f8;
      padding: 20rpx;
      font-size: 28rpx;
      color: #333;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;

      .checkbox-item {
        width: 33.33%;
        margin-bottom: 20rpx;
        display: flex;
        align-items: center;

        text {
          font-size: 26rpx;
          margin-left: 10rpx;
        }
      }
    }

    .cover-uploader {
      width: 100%;
      height: 400rpx;
      border: 1px dashed #ddd;
      border-radius: 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f8f8f8;

      .icon-add {
        font-size: 60rpx;
        color: #999;
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #999;
      }
    }

    .cover-preview {
      width: 100%;
      height: 400rpx;
      border-radius: 10rpx;
      overflow: hidden;
      position: relative;

      image {
        width: 100%;
        height: 100%;
      }

      .delete-btn {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 50rpx;
        height: 50rpx;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 40rpx;
        text-align: center;
        line-height: 45rpx;
        border-radius: 50%;
      }
    }
  }

  .submit-btn {
    background-color: #007aff;
    color: #fff;
    border-radius: 50rpx;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 32rpx;
    margin-top: 50rpx;
  }

  .back-btn {
    margin-top: 20rpx;
    background-color: #f8f8f8;
    color: #666;
    border-radius: 50rpx;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 32rpx;
  }
}
</style> 