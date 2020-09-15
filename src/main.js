import Vue from 'vue';
import App from './App.vue';
import router from './router';

import './assets/css/tailwind.css';

import Commerce from '@chec/commerce.js';

const commerce = (typeof process.env.VUE_APP_CHEC_PUBLIC_KEY !== 'undefined')
  ? new Commerce(process.env.VUE_APP_CHEC_PUBLIC_KEY)
  : null;

Vue.mixin({
  beforeCreate() {
    this.$commerce = commerce
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
