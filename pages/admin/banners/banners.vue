<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">轮播图管理</text>
    </view>

    <!-- 轮播图列表 -->
    <view class="banner-list">
      <view class="empty" v-if="bannerList.length === 0">
        <image src="/static/empty-banner.png" mode="aspectFit"></image>
        <text>暂无轮播图，点击下方按钮上传</text>
      </view>

      <view
        class="banner-item"
        v-else
        v-for="(item, index) in bannerList"
        :key="index"
      >
        <image :src="item.imageUrl" mode="aspectFill"></image>
        <view class="info">
          <input
            type="text"
            v-model="item.link"
            placeholder="请输入链接地址"
            @blur="handleUpdateLink(item)"
          />
          <view class="actions">
            <button size="mini" type="warn" @click="handleDelete(item)">
              删除
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 上传按钮 -->
    <view class="upload-section">
      <button type="primary" @click="handleUpload">上传新轮播图</button>
      <button class="back-btn" type="default" @click="goBack">返回首页</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bannerList: [],
      userInfo: null,
    };
  },
  onShow() {
    this.checkAdmin();
  },
  methods: {
    // 检查管理员权限
    checkAdmin() {
      const userInfo = uni.getStorageSync("userInfo");
      if (!userInfo || userInfo.role !== "admin") {
        uni.showToast({
          title: "无权限访问",
          icon: "none",
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        return;
      }
      this.userInfo = userInfo;
      this.getBannerList();
    },

    // 获取轮播图列表
    async getBannerList() {
      try {
        const { result } = await uniCloud.callFunction({
          name: "banners",
          data: {
            action: "list",
          },
        });
        if (result.code === 200) {
          this.bannerList = result.data || [];
        }
      } catch (e) {
        uni.showToast({
          title: "获取轮播图失败",
          icon: "none",
        });
      }
    },

    // 上传轮播图
    handleUpload() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];

          // 显示上传中
          uni.showLoading({
            title: "上传中...",
          });

          try {
            // 上传图片到云存储
            const uploadRes = await uniCloud.uploadFile({
              filePath: tempFilePath,
              cloudPath: `banner/${Date.now()}-${Math.random()
                .toString(36)
                .slice(-6)}.jpg`,
            });

            // 添加到数据库
            const { result } = await uniCloud.callFunction({
              name: "banners",
              data: {
                action: "add",
                userInfo: this.userInfo,
                data: {
                  imageUrl: uploadRes.fileID,
                  link: "",
                },
              },
            });

            if (result.code === 200) {
              uni.showToast({
                title: "上传成功",
                icon: "success",
              });
              this.getBannerList();

              // 通知首页刷新轮播图
              uni.$emit("refreshBannerList");
            } else {
              throw new Error(result.msg);
            }
          } catch (e) {
            uni.showToast({
              title: "上传失败",
              icon: "none",
            });
          } finally {
            uni.hideLoading();
          }
        },
      });
    },

    // 更新链接
    async handleUpdateLink(item) {
      try {
        const { result } = await uniCloud.callFunction({
          name: "banners",
          data: {
            action: "update",
            userInfo: this.userInfo,
            data: {
              _id: item._id,
              link: item.link,
            },
          },
        });

        if (result.code === 200) {
          uni.showToast({
            title: "更新成功",
            icon: "success",
          });

          // 通知首页刷新轮播图
          uni.$emit("refreshBannerList");
        }
      } catch (e) {
        uni.showToast({
          title: "更新失败",
          icon: "none",
        });
      }
    },

    // 删除轮播图
    async handleDelete(item) {
      uni.showModal({
        title: "提示",
        content: "确定要删除这张轮播图吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const { result } = await uniCloud.callFunction({
                name: "banners",
                data: {
                  action: "remove",
                  userInfo: this.userInfo,
                  data: {
                    _id: item._id,
                  },
                },
              });

              if (result.code === 200) {
                uni.showToast({
                  title: "删除成功",
                  icon: "success",
                });
                this.getBannerList();

                // 通知首页刷新轮播图
                uni.$emit("refreshBannerList");
              }
            } catch (e) {
              uni.showToast({
                title: "删除失败",
                icon: "none",
              });
            }
          }
        },
      });
    },

    // 跳转到资源上传管理页面
    goToResourceUpload() {
      uni.navigateTo({
        url: "/pages/admin/upload/upload",
      });
    },

    // 返回上一页
    goBack() {
      // 设置标记，指示轮播图已更新
      getApp().globalData = getApp().globalData || {};
      getApp().globalData.bannerUpdated = true;
      uni.navigateBack();
    },
  },
  // 在页面卸载前发送通知
  onUnload() {
    // 通知首页刷新轮播图
    uni.$emit("refreshBannerList");
  },
};
</script>

<style lang="scss">
.container {
  padding: 20rpx;

  .page-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .banner-list {
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60rpx 0;

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

    .banner-item {
      display: flex;
      margin-bottom: 30rpx;
      background-color: #fff;
      border-radius: 10rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

      image {
        width: 200rpx;
        height: 200rpx;
      }

      .info {
        flex: 1;
        padding: 20rpx;

        input {
          width: 100%;
          height: 60rpx;
          border: 1px solid #ddd;
          border-radius: 6rpx;
          padding: 0 20rpx;
          margin-bottom: 20rpx;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }

  .upload-section {
    position: fixed;
    bottom: 40rpx;
    left: 20rpx;
    right: 20rpx;

    .resource-btn {
      margin-top: 20rpx;
    }

    .back-btn {
      margin-top: 20rpx;
    }
  }
}
</style> 