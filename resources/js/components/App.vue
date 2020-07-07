<template>
  <v-app id="inspire">
    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      color="blue darken-3"
      dark
    >
      <v-spacer></v-spacer>
      <v-toolbar-title>
        <h1 class="display-1">
          <router-link to="/">
            Bravo
          </router-link>
        </h1>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:extension>
       <v-tabs
          v-model="tabs"
          centered
          grow
          slider-color="light-blue lighten-2"
        >
          <v-tab to="/">
            <v-icon v-if="$vuetify.breakpoint.smAndUp">mdi-briefcase</v-icon>
            Projects
          </v-tab>
          <v-tab to="/issues">
            <v-icon v-if="$vuetify.breakpoint.smAndUp">mdi-bug</v-icon>
            Issues
          </v-tab>
          <v-tab to="/clients">
            <v-icon v-if="$vuetify.breakpoint.smAndUp">mdi-account-group</v-icon>
            Clients
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <router-view></router-view>

      <v-snackbar
        v-model="snackbar.enabled"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        bottom center
      >
        {{ snackbar.message }}
        <v-btn
          color="white"
          text
          @click="snackbar.enabled = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-main>
    <div class="footer text-center mt-5 mb-3">
      Bravo &copy; 2020
    </div>
  </v-app>
</template>

<script>
  import Event from '../events'

  export default {
    name: 'App',
    data() {
      return {
        tabs: 'projects',
        snackbar: {
          enabled: false,
          timeout: 5000,
          message: '',
          color: ''
        },
      }
    },
    created () {
      Event.$on('alert', alert => {
        this.snackbar.message = alert.message
        this.snackbar.color = alert.color
        this.snackbar.enabled = true
      })
    },
  }
</script>

<style lang="scss" scoped>

</style>