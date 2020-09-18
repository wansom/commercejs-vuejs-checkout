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
        name: 'Checkout',
        component: () => import('../pages/Checkout.vue')
    },
    {
        path: '/confirmation',
        name: 'Confirmation',
        component: () => import('../pages/Confirmation.vue')
    },
]

const router = new VueRouter({ routes, mode: 'history' });

export default router;