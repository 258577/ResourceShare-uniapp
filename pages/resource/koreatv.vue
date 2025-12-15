<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from "@/components/ResourceCommon.vue";
const resourceType = ref("koreatv");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "都市", type: "urban" },
  { name: "爱情", type: "romance" },
  { name: "悬疑", type: "suspense" },
  { name: "校园", type: "campus" },
  { name: "古装", type: "historical" },
  { name: "职场", type: "workplace" },
]);
</script> 