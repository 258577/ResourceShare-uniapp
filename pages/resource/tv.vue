<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from '@/components/ResourceCommon.vue';
const resourceType = ref("tv");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "都市", type: "urban" },
  { name: "家庭", type: "family" },
  { name: "爱情", type: "romance" },
  { name: "古装", type: "historical" },
  { name: "玄幻", type: "fantasy" },
  { name: "悬疑", type: "suspense" },
]);
</script> 