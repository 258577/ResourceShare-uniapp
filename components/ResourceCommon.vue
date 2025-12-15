<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="iconfont icon-search"></text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索资源"
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <!-- 菜单栏 -->
    <view class="menu-container" v-if="showMenu">
      <scroll-view scroll-x="true" class="menu-scroll">
        <view
          class="menu-item"
          v-for="(item, index) in menuItems"
          :key="index"
          :class="{ active: currentMenuIndex === index }"
          @click="handleMenuSelect(index, item)"
        >
          {{ item.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 展示栏 -->
    <view class="content-container">
      <view class="resource-grid">
        <view
          class="resource-item"
          v-for="(item, index) in displayResources"
          :key="index"
        >
          <view class="resource-content" @click="handleResourceClick(item)">
            <image
              :src="item.cover"
              mode="aspectFill"
              class="resource-cover"
            ></image>
            <view class="resource-info">
              <text class="resource-title">{{ item.title }}</text>
              <br/>
              <text class="resource-desc">简介：{{ item.description }}</text>
            </view>
          </view>
          <view class="resource-actions">
            <favorite-button
              :resourceId="item._id"
              :title="item.title"
              :description="item.description"
              :cover="item.cover"
              :link="item.link"
            ></favorite-button>
          </view>
        </view>
      </view>
      <view class="empty-data" v-if="displayResources.length === 0">
        <text>暂无数据</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from "vue";
import FavoriteButton from "@/components/FavoriteButton.vue";

// 定义props
const props = defineProps({
  resourceType: {
    type: String,
    required: true,
  },
  menuItems: {
    type: Array,
    default: () => [],
  },
});

// 响应式状态
const searchKeyword = ref("");
const currentMenuIndex = ref(0);
const resources = ref([]);
const displayResources = ref([]);

// 计算属性
const showMenu = computed(() => {
  return props.menuItems && props.menuItems.length > 0;
});

// 方法
const loadResources = async () => {
  try {
    uni.showLoading({
      title: "加载中...",
    });

    const { result } = await uniCloud.callFunction({
      name: "resources",
      data: {
        action: "list",
        data: {
          resourceType: props.resourceType,
        },
      },
    });

    if (result.code === 200) {
      resources.value = result.data.list || [];
      filterResources();
    } else {
      uni.showToast({
        title: result.msg || "加载失败",
        icon: "none",
      });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
};

const filterResources = () => {
  if (!showMenu.value) {
    // 如果没有菜单，直接根据搜索关键词过滤
    displayResources.value = resources.value.filter((item) => {
      return (
        !searchKeyword.value ||
        item.title.includes(searchKeyword.value) ||
        item.description.includes(searchKeyword.value)
      );
    });
    return;
  }

  // 根据当前选择的菜单过滤
  const currentMenu = props.menuItems[currentMenuIndex.value];
  displayResources.value = resources.value.filter((item) => {
    // 首先检查资源类型是否匹配当前菜单
    const typeMatch =
      !currentMenu ||
      !currentMenu.type ||
      (item.types && item.types.includes(currentMenu.type));

    // 然后检查搜索关键词
    const searchMatch =
      !searchKeyword.value ||
      item.title.includes(searchKeyword.value) ||
      item.description.includes(searchKeyword.value);

    return typeMatch && searchMatch;
  });
};

const handleSearch = () => {
  filterResources();
};

const handleMenuSelect = (index, item) => {
  currentMenuIndex.value = index;
  filterResources();
};

const handleResourceClick = (item) => {

  if (!item || !item._id) {
    console.error("资源项数据不完整，缺少_id:", item);
    uni.showToast({
      title: "资源数据不完整",
      icon: "none",
    });
    return;
  }

  // 跳转到资源详情页
  uni.navigateTo({
    url: `/pages/resource/detail?id=${item._id}`,
    fail: (err) => {
      console.error("导航到详情页失败:", err);
    },
  });
};

// 生命周期钩子
onMounted(() => {
  loadResources();
});
</script>

<style lang="scss">
.container {
  padding: 20rpx;

  .search-container {
    padding: 20rpx 0;

    .search-box {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 50rpx;
      padding: 10rpx 30rpx;

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

  .menu-container {
    margin: 20rpx 0;

    .menu-scroll {
      white-space: nowrap;

      .menu-item {
        display: inline-block;
        padding: 20rpx 30rpx;
        font-size: 28rpx;
        color: #666;

        &.active {
          color: #007aff;
          font-weight: bold;
          position: relative;

          &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 30rpx;
            height: 4rpx;
            background-color: #007aff;
            border-radius: 2rpx;
          }
        }
      }
    }
  }

  .content-container {
    padding: 20rpx 0;

    .resource-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20rpx;

      .resource-item {
        background-color: #fff;
        border-radius: 12rpx;
        overflow: hidden;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;

        .resource-content {
          cursor: pointer;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .resource-cover {
          width: 100%;
          height: 200rpx;
        }

        .resource-info {
          padding: 20rpx;
          padding-bottom: 10rpx;
          flex: 1;

          .resource-title {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 10rpx;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .resource-desc {
            font-size: 24rpx;
            color: #999;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .resource-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0 20rpx 20rpx;
        }
      }
    }

    .empty-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;

      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style> 