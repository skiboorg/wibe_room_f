<script setup lang="ts">
const communityStore = useCommunityStore()
const {loading} = storeToRefs(communityStore);
</script>
<template>
  <BlockGroupHeader id="top"/>
  <div class="container">
    <BlockToIndex/>
    <div class="grid grid-cols-12 gap-10">
      <div class="col-span-12">
        <slot/>
      </div>

    </div>
  </div>
  <BlockFooter/>
</template>
