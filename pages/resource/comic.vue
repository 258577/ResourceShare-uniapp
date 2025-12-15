<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from "@/components/ResourceCommon.vue";
const resourceType = ref("comic");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "古代", type: "ancient" },
  { name: "现代", type: "modern" },
  { name: "玄幻", type: "fantasy" },
]);
</script> 