<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from '@/components/ResourceCommon.vue';
const resourceType = ref("movie");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "爱情", type: "romance" },
  { name: "喜剧", type: "comedy" },
  { name: "奇幻", type: "fantasy" },
  { name: "青春", type: "youth" },
  { name: "恐怖", type: "horror" },
  { name: "动画", type: "animation" },
  { name: "科幻", type: "sci-fi" },
  { name: "动作", type: "action" },
  { name: "战争", type: "war" },
]);
</script> 