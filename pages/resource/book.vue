<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from '@/components/ResourceCommon.vue';
const resourceType = ref("book");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "言情", type: "romance" },
  { name: "耽美", type: "bl" },
  { name: "玄幻", type: "fantasy" },
  { name: "武侠", type: "martial" },
  { name: "悬疑", type: "suspense" },
  { name: "科幻", type: "sci-fi" },
  { name: "历史", type: "historical" },
]);
</script> 