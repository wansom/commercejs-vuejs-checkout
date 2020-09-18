# Commerce.js Vue.js Checkout

This is a guide on adding checkout order capture functionality to our Vue.js application using Commerce.js. This is a
continuation from the previous guide on implementing cart functionality.

[See live demo](https://commercejs-vuejs-checkout.netlify.app/)

## Overview

The aim for this guide is to create a checkout page to capture our cart items into an order as well and add a
confirmation page to display a successful order. Below outlines what this guide will achieve:

1. Add page routing to the application
2. Generate a checkout token to capture the order
3. Create a checkout page with a form
4. Create a confirmation page to display an order reference

## Requirements

What you will need to start this project:

- An IDE or code editor
- NodeJS, at least v8/10
- npm or yarn
- Vue.js devtools (recommended)

## Prerequisites

This project assumes you have some knowledge of the below concepts before starting:

- Basic knowledge of JavaScript
- Some knowledge of Vue.js
- An idea of the JAMstack architecture and how APIs work

## Some things to note:

- The purpose of this guide is to focus on the Commerce.js layer and using Vue.js to build out the application
  therefore, we will not be going over any styling details.
- The checkout application code is available in the GitHub repo along with all styling details.

## Checkout

### 1. Set up routing

For fully functional single application page to scale, you will need to add routing in order to navigate to various view
pages such to a cart or checkout flow. Let's jump right back to where we left off from the previous cart guide and add
[VueRouter](https://router.vuejs.org/), the official routing library for Vue applications, to our project.

```bash
yarn add vue-router
# OR
npm i vue-router
```

After add the package, create a new folder called `router` in `src` with an `index.js` file. In this file is where we
will define our routes. First, we'll need to import in `vue-router` and explicitly install VueRouter with
`Vue.use(VueRouter)`.

Next, we define the routes we want to specify as views with the properties `path`, `name`, and `component`. This tells
Vue to render the specified components in view at the URL paths.

```js
// router/index.js

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
```
 
You can see above we intend to refactor the `ProductsList` component into a `router-view`. While we are at it, we will also add routing to a checkout and confirmation page which we will get to creating in the guide. We then instantiate a router instance and pass our defined route options to it. Here are some other [methods to adding routing](https://router.vuejs.org/guide/) to your Vue application depending on the use case.

Lastly, to have access to `this.$router` in the application's components, we inject the router option when the application mounts. 

```js
import router from './router';

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
```

Now with all the routes defined, we can refactor our `ProductsList` render in `App.vue` to use `router-view` and add our first routing to navigate to a checkout page from the `cart` component.

```html
<router-view
  :products="products"
  @add-to-cart="handleAddToCart"
/>
```

Let's then go in to `Cart.vue` and add a second button in the cart footer with a router link to push into a checkout view component that we will be adding later on.

```html
<div class="cart__footer">
  <router-link
    v-if="cart.line_items.length"
    class="cart__btn-checkout"
    to="/checkout"
  >
      Checkout
  </router-link>
</div>
```
The `to` prop in the `router-link` instance will look for a matching named route and push the `Checkout` component into view.

Let's now divert back to our `App.vue` where we will need to generate a checkout token before we move on any further. 

### 2. Generate a checkout token

Commerce.js provides a powerful method [`commerce.checkout.generateToken()`](https://commercejs.com/docs/sdk/checkout#generate-token) to capture all the data we need from the cart to initiate the checkout process simply by providing the cart ID in session, a product ID, or a product's permalink as an argument.

In `App.vue`, let's first initialize a `checkoutToken` in the data property and then create a helper function `generateCheckoutToken()` to generate the checkout token we need in order to capture our checkout.

```js
// App.vue

data: {
  return {
    checkoutToken: null,
  };
},

/**
 * Generates a checkout token
 * https://commercejs.com/docs/sdk/checkout#generate-token
 */
generateCheckoutToken() {
  this.$commerce.checkout.generateToken( this.cart.id, { type: 'cart' } ).then((token) => {
    this.checkoutToken = token;
  }).catch((error) => {
    console.log('There was an error in generating a token', error);
  });
},
```

The `commerce.checkout.generateToken()` takes in our cart ID and the identifier type `cart`. The type property is an optional parameter you can pass in as an identifier, in this case `cart` the type associated to `this.cart.id`.

To call this function, we could include it in the `mounted` lifecyle hook to generate a token when the component mounts or we could execute this function only when the cart prop changes. To do so, we can utilize the [`watch`](https://vuejs.org/v2/guide/computed.html?#Computed-vs-Watched-Property) property to watch for prop changes in the cart object, in which case, checking whether `line_items` in cart exists. The latter would be a more elegant way to handle the execution of `generateCheckoutToken()`.

Upon a successful request to generate the checkout token, you should receive an abbreviated response like the below json
data:

```json
{
  "id": "chkt_J5aYJ8zBG7dM95",
  "cart_id": "cart_ywMy2OE8zO7Dbw",
  "created": 1600411250,
  "expires": 1601016050,
  "analytics": {
    "google": {
      "settings": {
        "tracking_id": null,
        "linked_domains": null
      }
    }
  },
  "line_items": [
    {
      "id": "item_7RyWOwmK5nEa2V",
      "product_id": "prod_NqKE50BR4wdgBL",
      "name": "Kettle",
      "image": "https://cdn.chec.io/merchants/18462/images/676785cedc85f69ab27c42c307af5dec30120ab75f03a9889ab29|u9 1.png",
      "sku": null,
      "description": "<p>Black stove-top kettle</p>",
      "quantity": 1,
      "price": {
        "raw": 45.5,
        "formatted": "45.50",
        "formatted_with_symbol": "$45.50",
        "formatted_with_code": "45.50 USD"
      },
      "subtotal": {
        "raw": 45.5,
        "formatted": "45.50",
        "formatted_with_symbol": "$45.50",
        "formatted_with_code": "45.50 USD"
      },
      "variants": [],
      "conditionals": {
        "is_active": true,
        "is_free": false,
        "is_tax_exempt": false,
        "is_pay_what_you_want": false,
        "is_quantity_limited": false,
        "is_sold_out": false,
        "has_digital_delivery": false,
        "has_physical_delivery": false,
        "has_images": true,
        "has_video": false,
        "has_rich_embed": false,
        "collects_fullname": false,
        "collects_shipping_address": false,
        "collects_billing_address": false,
        "collects_extrafields": false
      },
    }
  ],
  "shipping_methods": [],
  "live": {
    "merchant_id": 18462,
    "currency": {
      "code": "USD",
      "symbol": "$"
    },
    "line_items": [
      {
        "id": "item_7RyWOwmK5nEa2V",
        "product_id": "prod_NqKE50BR4wdgBL",
        "product_name": "Kettle",
        "type": "standard",
        "sku": null,
        "quantity": 1,
        "price": {
          "raw": 45.5,
          "formatted": "45.50",
          "formatted_with_symbol": "$45.50",
          "formatted_with_code": "45.50 USD"
        },
        "line_total": {
          "raw": 45.5,
          "formatted": "45.50",
          "formatted_with_symbol": "$45.50",
          "formatted_with_code": "45.50 USD"
        },
        "variants": [],
        "tax": {
          "is_taxable": false,
          "taxable_amount": null,
          "amount": null,
          "breakdown": null
        }
      },
      {
        "id": "item_1ypbroE658n4ea",
        "product_id": "prod_kpnNwAMNZwmXB3",
        "product_name": "Book",
        "type": "standard",
        "sku": null,
        "quantity": 1,
        "price": {
          "raw": 13.5,
          "formatted": "13.50",
          "formatted_with_symbol": "$13.50",
          "formatted_with_code": "13.50 USD"
        },
        "line_total": {
          "raw": 13.5,
          "formatted": "13.50",
          "formatted_with_symbol": "$13.50",
          "formatted_with_code": "13.50 USD"
        },
        "variants": [],
        "tax": {
          "is_taxable": false,
          "taxable_amount": null,
          "amount": null,
          "breakdown": null
        }
      }
    ],
    "subtotal": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
    },
    "discount": [],
    "shipping": {
      "available_options": [],
      "price": {
        "raw": 0,
        "formatted": "0.00",
        "formatted_with_symbol": "$0.00",
        "formatted_with_code": "0.00 USD"
      }
    },
    "tax": {
      "amount": {
        "raw": 0,
        "formatted": "0.00",
        "formatted_with_symbol": "$0.00",
        "formatted_with_code": "0.00 USD"
      }
    },
    "total": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
    },
    "total_with_tax": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
    },
    "giftcard": [],
    "total_due": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
    },
    "pay_what_you_want": {
      "enabled": false,
      "minimum": null,
      "customer_set_price": null
    },
    "future_charges": []
  }
}
```
With the verbose data that the `generateCheckoutToken()` returns, we now have a checkout token object which contains everything we need to create the checkout page.

### 3. Create checkout page

Earlier on in step 1, we created the appropriate route options to navigate to a checkout page. We will now need to create that view page to render out when the router pushes to a `/checkout` path. 

First, let's create a new folder `src/pages` and a `Checkout.vue` page component. This page component is going to get real hefty quite fast, but we'll break it down in chunks throughout the rest of this guide.

The [Checkout resource](https://commercejs.com/docs/sdk/checkout) in Chec helps to handle an otherwise one of the most complex moving parts of an eCommerce application. The Checkout endpoint comes with the core `commerce.checkout.generateToken()` and `commerce.checkout.capture()` methods along with [Checkout helpers](https://commercejs.com/docs/sdk/concepts#checkout-helpers), additional helper functions for a seamless purchasing flow which we will touch on more later.

In the `Checkout.vue` page component, let's start first by initializing all the data we will need in this component to build out a checkout form. There are four core properties that are required to process an order using Commerce.js - `customer`, `shipping`, `fulfillment`, and `payment`. Let's start by defining the fields we will need to capture in the form. The main objects will all go under a `form` object. We will be bind these properties to each single field in our template with the [`v-model` directive](https://vuejs.org/v2/guide/forms.html).

```js
export default {
  name: 'Checkout',
  props: ['checkoutToken'],
  data() {
    return {
      form: {
        customer: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'janedoe@email.com',
        },
        shipping: {
          name: 'Jane Doe',
          street: '123 Fake St',
          city: 'San Francisco',
          stateProvince: 'CA',
          postalZipCode: '94107',
          country: 'US',
        },
        fulfillment: {
          selectedShippingOption: '',
        },
        payment: {
          cardNum: '4242 4242 4242 4242',
          expMonth: '01',
          expYear: '2023',
          ccv: '123',
          billingPostalZipCode: '94107',
        },
      },
    }
  }
},
```

And in our template fields, as mentioned, we will bind the data to the inputs:

```html
<form class="checkout__form">
  <h4 class="checkout__subheading">Customer Information</h4>

    <label class="checkout__label" for="firstName">First Name</label>
    <input class="checkout__input" type="text" v-model="form.customer.firstName" name="firstName" placeholder="Enter your first name" required />

    <label class="checkout__label" for="lastName">Last Name</label>
    <input class="checkout__input" type="text" v-model="form.customer.lastName" name="lastName" placeholder="Enter your last name" required />

    <label class="checkout__label" for="email">Email</label>
    <input class="checkout__input" type="text" v-model="form.customer.email" name="email" placeholder="Enter your email" required />

  <h4 class="checkout__subheading">Shipping Details</h4>

    <label class="checkout__label" for="fullname">Full Name</label>
    <input class="checkout__input" type="text" v-model="form.shipping.name" name="name" placeholder="Enter your shipping full name" required />

    <label class="checkout__label" for="street">Street Address</label>
    <input class="checkout__input" type="text" v-model="form.shipping.street" name="street" placeholder="Enter your street address" required />

    <label class="checkout__label" for="city">City</label>
    <input class="checkout__input" type="text" v-model="form.shipping.city" name="city" placeholder="Enter your city" required />

    <label class="checkout__label" for="postalZipCode">Postal/Zip Code</label>
    <input class="checkout__input" type="text" v-model="form.shipping.postalZipCode" name="postalZipCode" placeholder="Enter your postal/zip code" required />

    <label class="checkout__label" for="country">Country</label>
    <select v-model="form.shipping.country" name="country" class="checkout__select">
      <option value="" disabled>Country</option>
      <option v-for="(country, index) in countries" :value="index" :key="index">{{ country }}</option>
    </select>

    <label class="checkout__label" for="stateProvince">State/Province</label>
    <select v-model="form.shipping.stateProvince" name="stateProvince" class="checkout__select">
      <option class="checkout__option" value="" disabled>State/Province</option>
      <option v-for="(subdivision, index) in shippingSubdivisions" :value="index" :key="index">{{ subdivision }}</option>
    </select>

    <label class="checkout__label" for="selectedShippingOption">Shipping Method</label>
    <select v-model="form.fulfillment.selectedShippingOption" name="selectedShippingOption" class="checkout__select">
      <option class="checkout__select-option" value="" disabled>Select a shipping method</option>
      <option class="checkout__select-option" v-for="method in shippingOptions" :value="method.id" :key="method.id">{{ `${method.description} - $${method.price.formatted_with_code}` }}</option>
    </select>

  <h4 class="checkout__subheading">Payment Information</h4>

    <label class="checkout__label" for="cardNum">Credit Card Number</label>
    <input class="checkout__input" type="text" name="cardNum" v-model="form.payment.cardNum" placeholder="Enter your card number" />

    <label class="checkout__label" for="expMonth">Expiry Month</label>
    <input class="checkout__input" type="text" name="expMonth" v-model="form.payment.expMonth" placeholder="Card expiry month" />

    <label class="checkout__label" for="expYear">Expiry Year</label>
    <input class="checkout__input" type="text" name="expYear" v-model="form.payment.expYear" placeholder="Card expiry year" />

    <label class="checkout__label" for="ccv">CCV</label>
    <input class="checkout__input" type="text" name="ccv" v-model="form.payment.ccv" placeholder="CCV (3 digits)" />

  <button class="checkout__btn-confirm" @click.prevent="confirmOrder">Confirm Order</button>
</form>
```

### 3. Checkout helpers

```js
data() {
  return {
    shippingOptions: [],
    shippingSubdivisions: {},
    countries: {},
  }
```

```js
/**
  * Fetches a list of countries
  * https://commercejs.com/docs/sdk/checkout#list-available-shipping-countries
  */
fetchAllCountries(){
    this.$commerce.services.localeListCountries().then((countries) => {
        this.countries = countries.countries
    }).catch((error) => {
        console.log('There was an error fetching a list of countries', error);
    });
},
```

```js
/**
 * Fetches the subdivisions (provinces/states) in a country which
 * can be shipped to for the current checkout
 * https://commercejs.com/docs/sdk/checkout#list-available-shipping-subdivisions
 */
fetchStateProvince(){
    this.$commerce.services.localeListSubdivisions(this.form.shipping.country).then((resp) => {
        this.shippingSubdivisions = resp.subdivisions
    }).catch((error) => {
        console.log('There was an error fetching the subdivisions', error);
    });
},
```

```js
/**
 * Fetches the available shipping methods for the current checkout
 */
fetchShippingOptions(){
this.$commerce.checkout.getShippingOptions(this.checkoutToken.id, { country: 'US', region: 'CA' }).then((options) => {
    this.shippingOptions = options;
  }).catch((error) => {
    console.log('There was an error fetching the shipping methods', error);
});
},
```

### 4. Capture order

```js
confirmOrder() {
  const orderData = {
      line_items: this.checkoutToken.live.line_items,
      customer: {
      firstname: this.form.customer.firstName,
      lastname: this.form.customer.lastName,
      email: this.form.customer.email
    },
    shipping: {
      name: this.form.shipping.name,
      street: this.form.shipping.street,
      town_city: this.form.shipping.city,
      county_state: this.form.shipping.stateProvince,
      postal_zip_code: this.form.shipping.postalZipCode,
      country: this.form.shipping.country,
    },
    fulfillment: {
      shipping_method: this.form.fulfillment.selectedShippingOption
    },
    payment: {
      gateway: "test_gateway",
      card: {
        number: this.form.payment.cardNum,
        expiry_month: this.form.payment.expMonth,
        expiry_year: this.form.payment.expYear,
        cvc: this.form.payment.ccv,
        postal_zip_code: this.form.payment.billingPostalZipCode
      }
    }
  };
  this.$emit('confirm-order', this.checkoutToken.id, orderData);
}
```

```js
data() {
    return {
      products: [],
      cart: {},
      checkoutToken: null,
      order: null,
    };
  },
```

```js
/**
 * Captures the checkout
 * https://commercejs.com/docs/sdk/checkout#capture-order
 *
 * @param {string} checkoutTokenId The ID of the checkout token
 * @param {object} newOrder The new order object data
 */
handleConfirmOrder(checkoutTokenId, newOrder) {
  this.$commerce.checkout.capture(checkoutTokenId, newOrder).then((order) => {
    this.refreshCart();
    this.order = order;
    this.$router.push('/confirmation');
  }).catch((error) => {
      console.log('There was an error confirming your order', error);
  });
}
```

```html
    <router-view
      :products="products"
      @add-to-cart="handleAddToCart"
      @confirm-order="handleConfirmOrder"
      :checkout-token="checkoutToken"
      :order="order"
    />
```

### 5. Order confirmation

