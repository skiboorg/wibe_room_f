<script setup lang="ts">
const communityStore = useCommunityStore()
const {loading} = storeToRefs(communityStore);
</script>
<template>
  <BlockGroupHeader id="top"/>
  <div class="container">
    <BlockToIndex/>
    <div class="grid grid-cols-12 gap-10">
      <div class="col-span-3">
        <BlockGroupSideMenu/>
      </div>
      <div class="col-span-6">
        <slot/>
      </div>
      <div class="col-span-3">
        <SkeletonGroupInfo v-if="loading"/>
        <BlockGroupInfo v-else/>
      </div>
    </div>
  </div>
  <BlockFooter/>
</template>
