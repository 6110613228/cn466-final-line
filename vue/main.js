// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';

import main from './main.vue';

Vue.prototype.$liff = window.liff;
Vue.use(VueOnsen);

new Vue({
  render: (h) => h(main),
}).$mount('#app');
