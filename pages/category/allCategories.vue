<template>
  <view class="container">
    <view class="header">
      <text class="title">全部资源</text>
    </view>

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
        />
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="filter-container">
      <scroll-view scroll-x class="filter-scroll">
        <view
          class="filter-item"
          :class="{ active: activeType === '' }"
          @click="handleFilterChange('')"
          >全部</view
        >
        <view
          class="filter-item"
          v-for="(item, index) in allCategories"
          :key="index"
          :class="{ active: activeType === item.type }"
          @click="handleFilterChange(item.type)"
          >{{ item.name }}</view
        >
      </scroll-view>
    </view>

    <!-- 资源列表 -->
    <view class="resource-container">
      <view class="resource-list" v-if="resourceList.length > 0">
        <view
          class="resource-item"
          v-for="(item, index) in resourceList"
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
      <view class="loading-container" v-else-if="isLoading">
        <text>加载中...</text>
      </view>
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
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

// 所有分类数据
const allCategories = ref([
  {
    name: "电视剧",
    icon: "/static/category/tv.png",
    type: "tv",
  },
  {
    name: "电影",
    icon: "/static/category/movie.png",
    type: "movie",
  },
  {
    name: "软件",
    icon: "/static/category/software.png",
    type: "software",
  },
  {
    name: "小说",
    icon: "/static/category/book.png",
    type: "book",
  },
  {
    name: "短剧",
    icon: "/static/category/shortvideo.png",
    type: "shortvideo",
  },
  {
    name: "动漫",
    icon: "/static/category/anime.png",
    type: "anime",
  },
  {
    name: "综艺",
    icon: "/static/category/variety.png",
    type: "variety",
  },
  {
    name: "美剧",
    icon: "/static/category/usatv.png",
    type: "usatv",
  },
  {
    name: "漫画",
    icon: "/static/category/comic.png",
    type: "comic",
  },
  {
    name: "韩剧",
    icon: "/static/category/koreatv.png",
    type: "koreatv",
  },
  {
    name: "音乐",
    icon: "/static/category/music.png",
    type: "music",
  },
]);

// 资源数据
const resourceList = ref([]);
const searchKeyword = ref("");
const activeType = ref(""); // 当前选中的分类
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);

// 获取分类名称
const getCategoryName = (type) => {
  const category = allCategories.value.find((item) => item.type === type);
  return category ? category.name : "未知分类";
};

// 处理筛选变化
const handleFilterChange = (type) => {
  activeType.value = type;
  currentPage.value = 1;
  hasMore.value = true;
  resourceList.value = [];
  fetchResources();
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
          resourceType: activeType.value,
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

// 点击资源
const handleResourceClick = (item) => {
  uni.navigateTo({
    url: `/pages/resource/detail?id=${item._id}`,
  });
};

// 初始加载
onMounted(() => {
  fetchResources();
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;

  .header {
    margin-bottom: 20rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
    }
  }

  .search-container {
    margin-bottom: 20rpx;

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

  .filter-container {
    margin-bottom: 20rpx;

    .filter-scroll {
      white-space: nowrap;
      background-color: #fff;
      border-radius: 10rpx;
      padding: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

      .filter-item {
        display: inline-block;
        padding: 10rpx 30rpx;
        margin-right: 20rpx;
        font-size: 28rpx;
        color: #666;
        background-color: #f5f5f5;
        border-radius: 30rpx;

        &.active {
          background-color: #007aff;
          color: #fff;
        }
      }
    }
  }

  .resource-container {
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
  }
}
</style>