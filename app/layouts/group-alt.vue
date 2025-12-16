<template>
  <BlockGroupHeader/>
  <div class="container">
    <BlockToIndex/>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <div class="md:col-span-3">
        <BlockGroupSideMenu/>
      </div>
      <div class="md:col-span-9 mb-10">
        <slot/>
      </div>
    </div>
  </div>
  <BlockFooter/>
</template>
