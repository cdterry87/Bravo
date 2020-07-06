import Vue from 'vue'
import apolloProvider from './apollo'
import router from './router'
import vuetify from './vuetify'

import './register'

window._ = require('lodash');
window.moment = require('moment');

import App from './components/App'

const app = new Vue({
    el: '#app',
    apolloProvider,
    router,
    vuetify,
    components: {
        App
    }
})