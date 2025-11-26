<template>
    <main class=" center pt-6">
      <div class="container h-full">
        <slot/>
      </div>
    </main>
    <BlockFooter/>
</template>
<style scoped lang="sass">
.center
  height: calc(100vh -  86px)
</style>