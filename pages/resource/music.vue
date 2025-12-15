<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from "@/components/ResourceCommon.vue";
const resourceType = ref("music");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "流行", type: "pop" },
  { name: "欧美", type: "western" },
  { name: "粤语", type: "cantonese" },
]);
</script> 