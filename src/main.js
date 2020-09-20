import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/tailwind.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Commerce from '@chec/commerce.js';

// Create a new Commerce instance
const commerce = (typeof process.env.VUE_APP_CHEC_PUBLIC_KEY !== 'undefined')
  ? new Commerce(process.env.VUE_APP_CHEC_PUBLIC_KEY)
  : null;

// Inject commerce as a global property
Vue.mixin({
  beforeCreate() {
    this.$commerce = commerce
  }
});

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
