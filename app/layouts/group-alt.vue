<template>
  <BlockGroupHeader/>
  <div class="container">
    <BlockToIndex/>
    <div class="grid grid-cols-12 gap-10">
      <div class="col-span-3">
        <BlockGroupSideMenu/>
      </div>
      <div class="col-span-9">
        <slot/>
      </div>
    </div>
  </div>
  <BlockFooter/>
</template>
