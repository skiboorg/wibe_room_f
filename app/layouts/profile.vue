<script setup lang="ts">
const communityStore = useCommunityStore()
const {loading} = storeToRefs(communityStore);
</script>
<template>
  <BlockGroupHeader id="top"/>
  <div class="container">
    <BlockToIndex/>
        <slot/>
  </div>
  <BlockFooter/>
</template>
