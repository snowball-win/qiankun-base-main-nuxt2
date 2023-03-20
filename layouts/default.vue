<template>
  <div id="app-wrapper">
    <div id="content-wrapper" class="mui--text-center">
      <div>default</div>
      <div v-if="qiankunStarted" id="subapp"></div>
      <nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { registerMicroApps, start } from 'qiankun'
export default {
  data () {
    return {
      qiankunStarted: null
    }
  },
  computed: {
    ...mapState({
      apps: state => state.apps || [],
      sdk: state => state.sdk || null
    })
  },
  mounted () {
    this.init()
    this.qiankunStarted = window.qiankunStarted
  },
  methods: {
    init () {
      registerMicroApps(this.apps)
      if (!window.qiankunStarted) {
        window.qiankunStarted = true
        start()
      }
    }
  }
}
</script>

<style>
</style>
