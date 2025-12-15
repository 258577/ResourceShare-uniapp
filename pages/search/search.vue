<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="iconfont icon-search"></text>
        <input
          type="text"
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索资源"
          confirm-type="search"
          @confirm="handleSearch"
          focus
        />
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="result-container">
      <view class="result-header" v-if="hasSearched">
        <text class="result-tip">搜索结果 ({{ searchResult.length }})</text>
      </view>

      <view class="resource-list" v-if="searchResult.length > 0">
        <view
          class="resource-item"
          v-for="(item, index) in searchResult"
          :key="index"
          @click="handleResourceClick(item)"
        >
          <image :src="item.cover" mode="aspectFill"></image>
          <view class="info">
            <text class="title">{{ item.title }}</text>
            <text class="type">{{ getCategoryName(item.resourceType) }}</text>
            <text class="desc">{{ item.description }}</text>
          </view>
        </view>
      </view>

      <view class="empty-result" v-else-if="hasSearched">
        <text>未找到相关资源</text>
      </view>

      <view class="search-tip" v-else>
        <text>请输入关键词进行搜索</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 数据定义
const searchKeyword = ref("");
const searchResult = ref([]);
const hasSearched = ref(false);
const allCategories = ref([
  { type: "tv", name: "电视剧" },
  { type: "movie", name: "电影" },
  { type: "software", name: "软件" },
  { type: "book", name: "小说" },
  { type: "shortvideo", name: "短剧" },
  { type: "anime", name: "动漫" },
  { type: "variety", name: "综艺" },
  { type: "usatv", name: "美剧" },
  { type: "comic", name: "漫画" },
  { type: "koreatv", name: "韩剧" },
  { type: "music", name: "音乐" },
  { type: "more", name: "更多" },
]);

// 获取分类名称
const getCategoryName = (type) => {
  const category = allCategories.value.find((item) => item.type === type);
  return category ? category.name : "未知分类";
};

// 处理搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: "请输入搜索关键词",
      icon: "none",
    });
    return;
  }

  uni.showLoading({
    title: "搜索中...",
  });

  try {
    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "search",
        data: {
          keyword: searchKeyword.value.trim(),
        },
      },
    });

    if (result.code === 200) {
      searchResult.value = result.data || [];
      hasSearched.value = true;
    } else {
      uni.showToast({
        title: result.message || "搜索失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error("搜索异常:", e);
    uni.showToast({
      title: "搜索失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

// 点击资源
const handleResourceClick = (item) => {
  if (!item || !item._id) {
    uni.showToast({
      title: "资源数据不完整",
      icon: "none",
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/resource/detail?id=${item._id}`,
  });
};

// 从URL参数获取关键词
onLoad((options) => {
  if (options && options.keyword) {
    searchKeyword.value = decodeURIComponent(options.keyword);
    handleSearch();
  }
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;

  .search-container {
    padding-bottom: 20rpx;

    .search-box {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 50rpx;
      padding: 10rpx 30rpx;
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
  }

  .result-container {
    .result-header {
      margin: 20rpx 0;

      .result-tip {
        font-size: 28rpx;
        color: #666;
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

        image {
          width: 200rpx;
          height: 200rpx;
        }

        .info {
          flex: 1;
          padding: 20rpx;
          display: flex;
          flex-direction: column;

          .title {
            font-size: 32rpx;
            font-weight: bold;
            margin-bottom: 10rpx;
          }

          .type {
            font-size: 24rpx;
            color: #007aff;
            margin-bottom: 10rpx;
            background-color: rgba(0, 122, 255, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
            display: inline-block;
            max-width: max-content;
          }

          .desc {
            font-size: 26rpx;
            color: #666;
            flex: 1;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        }
      }
    }

    .empty-result,
    .search-tip {
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
  }
}
</style> 