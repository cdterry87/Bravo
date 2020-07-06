<template>
  <div id="loading" class="text-center">
    <v-progress-circular
      :size="250"
      :width="20"
      color="blue darken-3"
      indeterminate
    >
      Loading...
    </v-progress-circular>
  </div>
</template>

<script>
  export default {
    name: 'Loading'
  }
</script>

<style lang="scss" scoped>
  #loading {
    width: 100%;
    margin-top: 5rem;
  }
</style>