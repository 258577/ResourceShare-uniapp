<template>
  <view>
    <ResourceCommon :resource-type="resourceType" :menu-items="[]" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import ResourceCommon from '@/components/ResourceCommon.vue';

const resourceType = ref("shortvideo");
</script> 