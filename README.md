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
4. Create a confirmation page to display an order reference and receipt

## Requirements

What you will need to start this project:

- An IDE or code editor
- NodeJS, at least v8
- npm or yarn
- Vue.js devtools (recommended)

## Prerequisites

This project assumes you have some knowledge of the below concepts before starting:

- Basic knowledge of JavaScript
- Some knowledge of Vue.js
- An idea of the JAMstack architecture and how APIs work

## Some things to note

- The purpose of this guide is to focus on the Commerce.js layer and using Vue.js to build out the application
  therefore, we will not be going over any styling details
- We will not be going over any Font Awesome usage
- We will not be going over any UI details that do not pertain much to Commerce.js methods
- We will not go over props type checking using `PropTypes`

## Checkout

### 1. Set up routing

For fully functional SPAs (single page applications) to scale, you will need to add routing in order to navigate to various view
pages such to a cart or checkout flow. Let's jump right back to where we left off from the previous cart guide and add
[react-router](https://router.vuejs.org/), the official routing library for Vue applications, to our project.

```bash
yarn add vue-router
# OR
npm i vue-router
```

After adding the package, create a new folder called `router` in `src` with an `index.js` file. In this file is where we
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
 
You can see above we intend to refactor the `ProductsList` component into a `router-view`. While we are at it, we will
also add routing to a checkout and confirmation page which we will get to creating in the guide. We then instantiate a
router instance and pass our defined route options to it. Here are some other [methods to adding
routing](https://router.vuejs.org/guide/) to your Vue application depending on the use case.

Lastly, to have access to `this.$router` in the application's components, we inject the router option when the
application mounts. 

```js
import router from './router';

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
```

Now with all the routes defined, we can refactor our `ProductsList` render in `App.vue` to use `router-view` and add our
first routing to navigate to a checkout page from the `cart` component.

```html
<router-view
  :products="products"
  @add-to-cart="handleAddToCart"
/>
```

Let's then go in to `Cart.vue` and add a second button in the cart footer with a router link to push into a checkout
view component that we will be adding later on.

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
The `to` prop in the `router-link` instance will look for a matching route and push the `Checkout` component into
view.

Let's now divert back to our `App.vue` where we will need to generate a checkout token before we move on any further. 

### 2. Generate a checkout token

Commerce.js provides a powerful method
[`commerce.checkout.generateToken()`](https://commercejs.com/docs/sdk/checkout#generate-token) to capture all the data
we need from the cart and initiate the checkout process simply by providing a cart ID, a product ID, or a
product's permalink as an argument. We'll use a cart ID since we've already built the cart.

In `App.vue`, let's first initialize a `checkoutToken` in the data property and then create a helper function
`generateCheckoutToken()` to generate the checkout token we need in order to capture our checkout.

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

The `commerce.checkout.generateToken()` takes in our cart ID and the identifier type `cart`. The type property is an
optional parameter you can pass in as an identifier, in this case `cart` the type associated to `this.cart.id`.

To call this function, we could include it in the `mounted` lifecyle hook to generate a token when the component mounts,
or we could execute this function only when the cart prop changes. To do so, we can utilize the
[`watch`](https://vuejs.org/v2/guide/computed.html?#Computed-vs-Watched-Property) property to watch for prop changes in
the cart object, in which case checking whether `line_items` in cart exists. The latter would be a more elegant way to
handle the execution of `generateCheckoutToken()`.

Upon a successful request to generate the checkout token, you should receive an abbreviated response like the below json
data:

```json
{
  "id": "chkt_3l8XzLNjjR9WOl",
  "cart_id": "cart_nldQ8kbzy3QgMw",
  "created": 1602265312,
  "expires": 1602870112,
  "conditionals": {
    "collects_fullname": false,
    "collects_shipping_address": true,
    "collects_billing_address": false,
    "has_physical_delivery": true,
    "has_digital_delivery": true,
    "has_pay_what_you_want": false,
    "has_available_discounts": true,
    "collects_extrafields": false,
    "is_cart_free": false
  },
  "has": {
    "physical_delivery": true,
    "digital_delivery": true,
    "pay_what_you_want": false,
    "available_discounts": true
  },
  "is": {
    "cart_free": false
  },
  "products": [
    {
      "id": "prod_NqKE50BR4wdgBL",
      "created": 1594075580,
      "last_updated": 1600635997,
      "active": true,
      "permalink": "TSUTww",
      "name": "Kettle",
      "description": "<p>Black stove-top kettle</p>",
      "price": {
        "raw": 45.5,
        "formatted": "45.50",
        "formatted_with_symbol": "$45.50",
        "formatted_with_code": "45.50 USD"
      },
      "quantity": 0,
      "media": {
        "type": "image",
        "source": "https://cdn.chec.io/merchants/18462/images/676785cedc85f69ab27c42c307af5dec30120ab75f03a9889ab29|u9 1.png"
      },
      "sku": null,
      "sort_order": 0,
      "seo": {
        "title": null,
        "description": null
      },
      "is": {
        "active": true,
        "free": false,
        "tax_exempt": false,
        "pay_what_you_want": false,
        "quantity_limited": false,
        "sold_out": false
      },
      "has": {
        "digital_delivery": false,
        "physical_delivery": true,
        "images": true,
        "video": false,
        "rich_embed": false
      },
      "checkout_url": {
        "checkout": "https://checkout.chec.io/TSUTww?checkout=true",
        "display": "https://checkout.chec.io/TSUTww"
      },
      "extrafields": [],
      "variants": [],
      "categories": [
        {
          "id": "cat_3zkK6oLvVlXn0Q",
          "slug": "office",
          "name": "Home office"
        }
      ],
      "assets": [
        {
          "id": "ast_7ZAMo1Mp7oNJ4x",
          "url": "https://cdn.chec.io/merchants/18462/images/676785cedc85f69ab27c42c307af5dec30120ab75f03a9889ab29|u9 1.png",
          "is_image": true,
          "filename": "",
          "file_size": null,
          "file_extension": "",
          "meta": [],
          "created_at": 1594075541,
          "updated_at": 1594075541
        }
      ],
      "related_products": []
    },
  ],
  "gateways": {
    "available": {
      "test_gateway": true,
      "stripe": false,
      "square": false,
      "paypal": false,
      "paymill": false,
      "razorpay": false,
      "manual": false
    },
    "available_count": 1,
    "test_gateway": {
      "type": "card",
      "settings": []
    }
  },
  "shipping_methods": [
    {
      "id": "ship_kpnNwAjO9omXB3",
      "description": "US",
      "price": {
        "raw": 5,
        "formatted": "5.00",
        "formatted_with_symbol": "$5.00",
        "formatted_with_code": "5.00 USD"
      },
      "countries": [
        "US"
      ],
      "regions": {
        "US": [
          "US-AL",
        ]
      }
    },
  ],
  "live": {
    "merchant_id": 18462,
    "currency": {
      "code": "USD",
      "symbol": "$"
    },
    "subtotal": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
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
    "total_due": {
      "raw": 59,
      "formatted": "59.00",
      "formatted_with_symbol": "$59.00",
      "formatted_with_code": "59.00 USD"
    },
    "line_items": [
      {
        "id": "item_7RyWOwmK5nEa2V",
        "product_id": "prod_NqKE50BR4wdgBL",
        "name": "Kettle",
        "product_name": "Kettle",
        "media": {
          "type": "image",
          "source": "https://cdn.chec.io/merchants/18462/images/676785cedc85f69ab27c42c307af5dec30120ab75f03a9889ab29|u9 1.png"
        },
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
        "type": "standard",
        "tax": {
          "is_taxable": false,
          "taxable_amount": null,
          "amount": null,
          "breakdown": null
        },
        "variants": []
      },
    ],
  },
}
```
With the verbose data that the `generateCheckoutToken()` returns, we now have a checkout token object which contains
everything we need to create the checkout page.

### 3. Create checkout page

Earlier in step 1 we created the appropriate route options to navigate to a checkout page. We will now need to
create that view page to render when the router sends us to the `/checkout` path. 

First, let's create a new folder `src/pages` and a `Checkout.vue` page component. This page component is going to get
real hefty quite fast, but we'll break it down in chunks throughout the rest of this guide.

The [Checkout resource](https://commercejs.com/docs/sdk/checkout) in Chec helps to handle one of the most
complex moving parts of an eCommerce application. The Checkout endpoint comes with the core
`commerce.checkout.generateToken()` and `commerce.checkout.capture()` methods along with [Checkout
helpers](https://commercejs.com/docs/sdk/concepts#checkout-helpers) - additional helper functions for a seamless
purchasing flow which we will touch on more later.

In the `Checkout.vue` page component, let's start first by initializing all the data we will need in this component to
build a checkout form. There are four core properties that are required to process an order using Commerce.js -
`customer`, `shipping`, `fulfillment`, and `payment`. Let's start by defining the fields we will need to capture in the
form. The main property objects will all go under a `form` object. We will then bind these properties to each single
field in our template with the [`v-model` directive](https://vuejs.org/v2/guide/forms.html).

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
          shippingOption: '',
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

And in our template fields, as mentioned, we will bind the data to each of the `v-model` attributes in the input
elements. The inputs will be pre-filled with the state data we created above.

```html
<form class="checkout__form">
  <h4 class="checkout__subheading">Customer information</h4>

    <label class="checkout__label" for="firstName">First name</label>
    <input class="checkout__input" type="text" v-model="form.customer.firstName" name="firstName" placeholder="Enter your first name" required />

    <label class="checkout__label" for="lastName">Last name</label>
    <input class="checkout__input" type="text" v-model="form.customer.lastName" name="lastName" placeholder="Enter your last name" required />

    <label class="checkout__label" for="email">Email</label>
    <input class="checkout__input" type="text" v-model="form.customer.email" name="email" placeholder="Enter your email" required />

  <h4 class="checkout__subheading">Shipping details</h4>

    <label class="checkout__label" for="fullname">Full name</label>
    <input class="checkout__input" type="text" v-model="form.shipping.name" name="name" placeholder="Enter your shipping full name" required />

    <label class="checkout__label" for="street">Street address</label>
    <input class="checkout__input" type="text" v-model="form.shipping.street" name="street" placeholder="Enter your street address" required />

    <label class="checkout__label" for="city">City</label>
    <input class="checkout__input" type="text" v-model="form.shipping.city" name="city" placeholder="Enter your city" required />

    <label class="checkout__label" for="postalZipCode">Postal/Zip code</label>
    <input class="checkout__input" type="text" v-model="form.shipping.postalZipCode" name="postalZipCode" placeholder="Enter your postal/zip code" required />

  <h4 class="checkout__subheading">Payment information</h4>

    <label class="checkout__label" for="cardNum">Credit card number</label>
    <input class="checkout__input" type="text" name="cardNum" v-model="form.payment.cardNum" placeholder="Enter your card number" />

    <label class="checkout__label" for="expMonth">Expiry month</label>
    <input class="checkout__input" type="text" name="expMonth" v-model="form.payment.expMonth" placeholder="Card expiry month" />

    <label class="checkout__label" for="expYear">Expiry year</label>
    <input class="checkout__input" type="text" name="expYear" v-model="form.payment.expYear" placeholder="Card expiry year" />

    <label class="checkout__label" for="ccv">CCV</label>
    <input class="checkout__input" type="text" name="ccv" v-model="form.payment.ccv" placeholder="CCV (3 digits)" />

  <button class="checkout__btn-confirm" @click.prevent="confirmOrder">Confirm order</button>
</form>
```

The fields above contain all the customer details and payments inputs we will need to collect from the customer. The
shipping method data is also required in order to ship the items to the customer. Chec and Commerce.js has verbose
shipment and fulfillment methods to handle this process. In the [Chec Dashboard](https://dashboard.chec.io/), worldwide
shipping zones can be added in Settings > Shipping and then enabled at the product level. For this demo merchant
account, we have enabled international shipping for each product. In the next section, we will touch on some Commerce.js
checkout helper functions that will: 
-  Easily fetch a full list of countries, states, provinces, and shipping options to populate the form fields for
   fulfillment data collection
-  Get the live object and update it with any data changes from the form fields


### 3. Checkout helpers

Let's first initialize the empty objects and arrays that we will need to store the responses from the [checkout
helper](https://commercejs.com/docs/sdk/concepts#checkout-helpers) methods and list them under the form fields data:

```js
data() {
  return {
    liveObject: {},
    shippingOptions: [],
    shippingSubdivisions: {},
    countries: {},
    loading: false,
  }
```

We will go through each of the initialized data and the checkout helper method that pertains to it. First let's have a
look at the `liveObject`. The [live object](https://commercejs.com/docs/sdk/concepts#the-live-object) is a living object
which adjusts to show the live tax rates, prices, and totals for a checkout token. This object will be updated every
time a checkout helper executes and the data can be used to reflect the changing UI i.e. when the shipping option is
applied or when tax is calculated. Let's now first create a method that will fetch the live object:

```js
/**
 * Gets the live object
 * https://commercejs.com/docs/api/?javascript--cjs#get-the-live-object
 */
getLiveObject(checkoutTokenId) {
  this.$commerce.checkout.getLive(checkoutTokenId).then((liveObject) => {
    this.liveObject = liveObject;
  }).catch((error) => {
    console.log('There was an error getting the live object', error);
  });
},
```

This `getLiveObject()` function will fetch the current checkout live object at `GET
v1/checkouts/{checkout_token_id}/live` with the method
[`commerce.checkout.getLive`](https://commercejs.com/docs/api/?javascript--cjs#get-the-live-object) and store the object
in `this.liveObject` that we created earlier. 

Upon a successful call, an abbreviated response might look like the below JSON data:

```json
{
  "merchant_id": 18462,
  "currency": {
    "code": "USD",
    "symbol": "$"
  },
  "line_items": [
    {
      "id": "item_7RyWOwmK5nEa2V",
      "product_id": "prod_8XO3wpDrOwYAzQ",
      "product_name": "Coffee",
      "type": "standard",
      "sku": null,
      "quantity": 1,
      "price": {
        "raw": 7.5,
        "formatted": "7.50",
        "formatted_with_symbol": "$7.50",
        "formatted_with_code": "7.50 USD"
      },
      "line_total": {
        "raw": 7.5,
        "formatted": "7.50",
        "formatted_with_symbol": "$7.50",
        "formatted_with_code": "7.50 USD"
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
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "discount": [],
  "shipping": {
    "available_options": [
      {
        "id": "ship_kpnNwAjO9omXB3",
        "description": "International",
        "price": {
          "raw": 5,
          "formatted": "5.00",
          "formatted_with_symbol": "$5.00",
          "formatted_with_code": "5.00 USD"
        },
        "countries": [
          "US",
          "CA",
        ]
      }
    ],
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
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "total_with_tax": {
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "giftcard": [],
  "total_due": {
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
}
```

We will be working with this response later when we update the selected shipping method. Next, let's start creating
methods that will fetch a list of countries and subdivisions for a particular country.

With a created function `fetchShippingCountries()`, we will use
[`commerce.services.localeListShippingCountries()`](https://commercejs.com/docs/sdk/checkout#list-available-shipping-countries) at `GET v1/services/locale/{checkout_token_id}/countries` to fetch and list all countries available to ship to the checkout.

```js
/**
 * Fetches a list of countries available to ship to checkout token
 * https://commercejs.com/docs/sdk/checkout#list-available-shipping-countries
 *
 * @param {string} checkoutTokenId
 */
fetchShippingCountries(checkoutTokenId) {
  this.$commerce.services.localeListShippingCountries(checkoutTokenId).then((countries) => {
      this.countries = countries.countries
  }).catch((error) => {
      console.log('There was an error fetching a list of countries', error);
  });
},
```

The response will be stored in the countries object we initialized earlier in our data object. We will then be able to
use this countries object to iterate and display a list of countries in a select element later. The
`fetchStateProvince()` function below will walk through the same pattern as well.

A country code argument is required to make a request with
[`commerce.services.localeListSubdivisions()`](https://commercejs.com/docs/api/?javascript--cjs#list-all-subdivisions-for-a-country)
to `GET v1/services/locale/{country_code}/subdivisions` to get a list of all subdivisions for that particular country.

```js
/**
 * Fetches the subdivisions (provinces/states) in a country which
 * can be shipped to for the current checkout
 * https://commercejs.com/docs/sdk/checkout#list-available-shipping-subdivisions
 *
 * @param {string} checkoutTokenId
 * @param {string} countryCode
 */
fetchShippingSubdivisions(checkoutTokenId, countryCode) {
  this.$commerce.services.localeListShippingSubdivisions(checkoutTokenId, countryCode).then((resp) => {
      this.shippingSubdivisions = resp.subdivisions
  }).catch((error) => {
      console.log('There was an error fetching the subdivisions', error);
  });
},
```

With a successful request, the response will be stored in the `this.shippingSubdivions` array and will be used to
iterate and output onto a select element in our template later on.

For our next checkout helper function, we will fetch the current shipping options available in our merchant account.
This function will fetch all the shipping options that were registered in the dashboard and are applicable to the products in our cart
using the [`commerce.checkout.getShippingOptions()`](https://commercejs.com/docs/sdk/checkout#get-shipping-methods)
method. This function takes in two required parameters - the `checkoutTokenId`, the country code for the provide
`country` in our data, and the `region` is optional.


```js
/**
 * Fetches the available shipping methods for the current checkout
 * https://commercejs.com/docs/sdk/checkout#get-shipping-methods
 */
fetchShippingOptions(checkoutTokenId, country, stateProvince){
  this.$commerce.checkout.getShippingOptions(checkoutTokenId,
    { country: country, region: stateProvince }).then((options) => {
      this.shippingOptions = options;
    }).catch((error) => {
      console.log('There was an error fetching the shipping methods', error);
  });
},
```

When the promise resolves, the response will be stored into `this.shippingOptions` which we will then later use to
render a list of shipping options in our template.

Our last checkout helper we will be adding before we start to hook up the data in our template will be the
[`commerce.checkout.checkShippingOption()`](https://commercejs.com/docs/sdk/checkout#check-shipping-method)
method. This method helps to validate the shipping option selected for the provided checkout token and applies it to the
live object to then send along with an order.

First, we create a function called `validateShippingOption()` and call the `commerce.checkout.checkShippingOption()`
method. This function takes in the `checkoutToken.id`, and shipping details object with the `shippingOptionId`, the
`country`, and the `region` data. When the promise resolves, we will update `fulfillment.shippingOption` with the
`shippingOptionId` as well as the `liveObject` will be updated.

```js
/**
 * Checks and validates the shipping method
 * https://commercejs.com/docs/api/?javascript--cjs#check-shipping-method
 */
validateShippingOption(shippingOptionId) {
  this.commerce.checkout.checkShippingOption(this.checkoutToken.id, {
    shipping_option_id: shippingOptionId,
    country: this.form.shipping.country,
    region: this.form.shipping.stateProvince
  }).then((resp) => {
    this.fulfillment.shippingOption = resp.id;
    this.liveObject = resp.live;
  }).catch((error) => {
    console.log('There was an error setting the shipping option', error);
  })
},
```
With a successful request, the live object will be returned along with the payload. An abbreviated response will look
like the below JSON data:

```json
{
  "merchant_id": 18462,
  "currency": {
    "code": "USD",
    "symbol": "$"
  },
  "line_items": [
    {
      "id": "item_7RyWOwmK5nEa2V",
      "product_id": "prod_8XO3wpDrOwYAzQ",
      "product_name": "Coffee",
      "type": "standard",
      "sku": null,
      "quantity": 1,
      "price": {
        "raw": 7.5,
        "formatted": "7.50",
        "formatted_with_symbol": "$7.50",
        "formatted_with_code": "7.50 USD"
      },
      "line_total": {
        "raw": 7.5,
        "formatted": "7.50",
        "formatted_with_symbol": "$7.50",
        "formatted_with_code": "7.50 USD"
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
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "discount": [],
  "shipping": {
    "available_options": [
      {
        "id": "ship_kpnNwAjO9omXB3",
        "description": "International",
        "price": {
          "raw": 5,
          "formatted": "5.00",
          "formatted_with_symbol": "$5.00",
          "formatted_with_code": "5.00 USD"
        },
      }
    ],
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
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "total_with_tax": {
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
  "total_due": {
    "raw": 7.5,
    "formatted": "7.50",
    "formatted_with_symbol": "$7.50",
    "formatted_with_code": "7.50 USD"
  },
}
```

Alright, that wraps up all the checkout helper functions we will create for our checkout page. Now it's time to execute
and hook up the responses to our template. Let's get right to it!

Let's start with calling our `getLiveObject` when the component mounts:

```js
mounted() {
  if (this.checkoutToken == null) {
    return;
  }
  this.getLiveObject(this.checkoutToken.id);
},
```

In the `mounted()` lifecycle hook, we first check that the `checkoutToken` exists before we call the `getLiveObject`
with the `checkoutToken.id` passed in as an argument.

Next, we will also call both the `fetchShippingCountries()` and `fetchShippingSubdivisions()` functions when the component is created.
This ensures that we have our data ready to use when we render our select options in our template later.

```js
created() {
  this.fetchShippingCountries();
  this.fetchShippingSubdivisions(this.form.shipping.country);
},
```

In the same vein, we will also need to call the `fetchShippingOptions()` function to display the list of shipping
options we have available. Let's add `this.fetchShippingOptions(this.checkoutToken.id, this.form.shipping.country,
this.form.shipping.stateProvince)` in the mounted hook after calling `this.getLiveObject(this.checkoutToken.id)`:

```js
mounted() {
  if (this.checkoutToken === null) {
      return;
  }
  if (this.form.shipping.country) {
    this.fetchShippingOptions(this.checkoutToken.id, this.form.shipping.country, this.form.shipping.stateProvince);
  }
  this.getLiveObject(this.checkoutToken.id);
}
```

Lastly, let's create a couple of `watch` and `computed` properties to handle validating our shipping option and setting
the selected shipping option.

```js
watch: {
  selectedShippingOption() {
    this.validateShippingOption(this.form.fulfillment.shippingOption, this.form.shipping)
  }
},
computed: {
  selectedShippingOption() {
    return this.form.fulfillment.shippingOption;
  },
```

We will now need to bind all the data responses to the shipping form fields. In the shipping section of the template we
created earlier on, place all the markup underneath the **Postal/Zip code** input field:

```html
<label class="checkout__label" for="country">Country</label>
<select v-model="form.shipping.country" name="country" class="checkout__select">
  <option value="" disabled>Country</option>
  <option v-for="(country, index) in countries" :value="index" :key="index">{{ country }}</option>
</select>

<label class="checkout__label" for="stateProvince">State/province</label>
<select v-model="form.shipping.stateProvince" name="stateProvince" class="checkout__select">
  <option class="checkout__option" value="" disabled>State/province</option>
  <option v-for="(subdivision, index) in shippingSubdivisions" :value="index" :key="index">{{ subdivision }}</option>
</select>

<label class="checkout__label" for="shippingOption">Shipping method</label>
<select v-model="form.fulfillment.shippingOption" name="shippingOption" class="checkout__select">
  <option class="checkout__select-option" value="" disabled>Select a shipping method</option>
  <option class="checkout__select-option" v-for="(method, index) in shippingOptions" :value="method.id" :key="index">{{ `${method.description} - $${method.price.formatted_with_code}` }}</option>
</select>
```
The three fields we just added: 
- Binds the `form.shipping.country` as the selected country and loops through the `shippingSubdivisions` array to render
  as options
- Binds the `form.shipping.stateProvince` as the selected state/province and iterates through the `countries` object to display
  the available list of countries
- Binds the `form.fulfillment.shippingOption` and loops through the `shippingOptions` array to render as options
  in the **Shipping method** field.

Once all the data is bound to the field we are then able to collect the necessary data to convert the checkout into an order object.

### 4. Capture order

With all the data collected we'll now need to associate it to each of the order properties in an appropriate data
structure so we can confirm the order.

Let's create a `confirmOrder()` function and structure our returned data. Have a look at the [expected structure
here](https://commercejs.com/docs/sdk/checkout#capture-order) to send an order request.

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
      shipping_method: this.form.fulfillment.shippingOption
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
  this.loading = true;
  this.$emit('confirm-order', this.checkoutToken.id, orderData);
}
```

Follow the exact structure of the data we intend to send and emit the object along with the required `checkoutToken.id`.
Note that first we are setting the `loading` to true while the order request will be resolving and we also emitting an
event called `confirm-order` that we'll need to attach to a click event in a button element to process the form submission.
So let's add that right now as the last element before the closing `</form>` tag:

```html
<button class="checkout__btn-confirm" :disabled="loading" @click.prevent="confirmOrder">
  {{ loading ? 'Loading...' : 'Confirm order' }}
</button>
```

Let's attach our `confirmOrder()` method to the click event and use a conditional statement in the template that will
first render a `Loading...` while the promise is resolving, which we will get to later when we make a request to capture
our order. We'll also make the button disabled while the order is processing to stop our customers from double clicking
on the button and causing it to process twice.

We'll then get back to our `App.vue` to initialize an `order` data with a `null` value where we will be storing our
returned order object.

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

Before we create an event handler to deal with our order capture, let's use another Commerce.js method called
[`commerce.checkout.refreshCart()`](https://commercejs.com/docs/sdk/cart#refresh-cart). When we call this function,
it will refresh the cart in our state/session when we confirm our order:

```js
/**
 * Refreshes to a new cart
 * https://commercejs.com/docs/sdk/cart#refresh-cart
 */
refreshCart() {
  this.$commerce.cart.refresh().then((newCart) => {
    this.cart = newCart;
  }).catch((error) => {
    console.log('There was an error refreshing your cart', error);
  });
},
```

Now let's create a helper function which will capture our order with the method
[`commerce.checkout.capture()`](https://commercejs.com/docs/sdk/checkout#capture-order). It takes in the
`checkoutTokenId` and the `newOrder` parameters. Upon the promise resolution, we will first refresh the cart,
store the `order` into the `this.order` property, and lastly use the router to push to a `confirmation` page
which we will be creating in the last step.

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
    this.$router.push('/confirmation', { order });
  }).catch((error) => {
      console.log('There was an error confirming your order', error);
  });
},
```
Now let's make sure we update and bind the necessary props and event handlers to `router-view` instance: 

```html
<router-view
  :products="products"
  :cart="cart"
  :checkout-token="checkoutToken"
  @add-to-cart="handleAddToCart"
  @confirm-order="handleConfirmOrder"
/>
```

Lastly we will now create a simple confirmation view to display a successful order page.

### 5. Order confirmation

Under `src/pages` create a new page component and name it `Confirmation.vue`. Let's first write the necessary data
in the script tag:

```js
export default {
  name: 'Confirmation',
  props: ['order'],
  methods: {
    backToHome() {
      this.$router.push('/');
      // For setting nav back to visible
      this.$emit('back-to-home');
    }
  }
}
```

We first define an order prop for the parent component `App.vue` to pass the order object down then we create a method
called `backToHome()` to attach a **Back to home** link we will need in our confirmation page.

Next, we'll create our template to output a simple UI for the confirmation screen:

```html
<template>
  <div class="confirmation">
    <div class="confirmation__wrapper">
      <div class="confirmation__wrapper-message">
        <h3>Thank you for your purchase, {{ order.customer.firstname }} {{ order.customer.lastname }}!</h3>
        <h4 class="confirmation__wrapper-reference">
          <span>Order ref:</span> {{ order.customer_reference }}
        </h4>
      </div>
      <button type="button" class="confirmation__wrapper-back" @click="backToHome">
        <font-awesome-icon size="1x" icon="arrow-left" color="#292B83"/>
        <span>Back to home</span>
      </button>
    </div>
  </div>
</template>
```
This template will render a message containing the customer's name and an order reference. The **Back to home**
button will change the route and send the user back to the home page.

Now in our `App.vue` again, we'll attach our order prop as well as our `backToHome()` event to our `router-view`
instance:

```html
<router-view
  :products="products"
  :cart="cart"
  :checkout-token="checkoutToken"
  :order="order"
  @confirm-order="handleConfirmOrder"
  @add-to-cart="handleAddToCart"
  @back-to-home="handleBackToHome"
/>
```
We attached a `handleBackToHome` function to set our cart navigation back to true. We have left the cart navigation UI
details out of this tutorial.

## That's it!

You have now wrapped up the full series of the Commerce.js Vue.js demo store guides! You can find the full finished code
in [GitHub here](https://github.com/jaepass/commercejs-vuejs-checkout)!
