<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="menuItems" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from '@/components/ResourceCommon.vue';
const resourceType = ref("software");
const menuItems = ref([
  { name: "全部", type: "" },
  { name: "办公", type: "office" },
  { name: "编程", type: "programming" },
  { name: "图像图形", type: "graphics" },
  { name: "建模", type: "modeling" },
  { name: "社交", type: "social" },
]);
</script> 