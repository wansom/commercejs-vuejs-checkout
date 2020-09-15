import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'ProductsList',
        component: () => import('../components/ProductsList.vue')
    },
    {
        path: '/checkout',
        name: 'checkout',
        component: () => import('../pages/Checkout.vue')
    }, 
]

const router = new VueRouter({ routes, mode: 'history' });

export default router;