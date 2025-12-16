<script setup lang="ts">
const communityStore = useCommunityStore()
const {loading} = storeToRefs(communityStore);
</script>
<template>
  <BlockGroupHeader id="top"/>
  <div class="container">
    <BlockToIndex/>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <div class="md:col-span-3">
        <BlockGroupSideMenu/>
      </div>
      <div class="md:col-span-6 mb-10">
        <slot/>
      </div>
      <div class="hidden md:block col-span-3">
        <SkeletonGroupInfo v-if="loading"/>
        <BlockGroupInfo v-else/>
      </div>
    </div>
  </div>
  <BlockFooter/>
</template>
