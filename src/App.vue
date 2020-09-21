<template>
  <div>
    <div class="nav" v-if="isNavVisible">
      <div
        role="button"
        tabindex="0"
        class="nav__cart"
        @click="toggleCart"
      >
        <button v-if="!isCartVisible" class="nav__cart-open">
          <font-awesome-icon size="2x" icon="shopping-bag" color="#292B83"/>
          <span v-if="cart !== null">{{ cart.total_items }}</span>
        </button>
        <button class="nav__cart-close" v-else>
          <font-awesome-icon size="1x" icon="times" color="white"/>
        </button>
      </div>
    </div>
    <Cart
      v-if="isCartVisible"
      :cart="cart"
      @remove-from-cart="handleRemoveFromCart"
      @empty-cart="handleEmptyCart"
      @checkout="handleNavigateTocheckout"
    />
    <Hero
      :merchant="merchant"
    />
    <router-view
      :products="products"
      :cart="cart"
      :checkout-token="checkoutToken"
      :order="order"
      @add-to-cart="handleAddToCart"
      @back-to-home="handleBackToHome"
      @confirm-order="handleConfirmOrder"
    />
  </div>
</template>I

<script>
import Cart from './components/Cart';
import Hero from './components/Hero'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShoppingBag, faTimes } from '@fortawesome/free-solid-svg-icons';

library.add(faShoppingBag, faTimes);

export default {
  name: 'app',
  components: {
    Hero,
    Cart,
  },
  data() {
    return {
      merchant: {},
      products: [],
      cart: {},
      isCartVisible: false,
      isNavVisible: true,
      checkoutToken: null,
      order: null,
    };
  },
  created() {
    this.fetchMerchantDetails();
    this.fetchProducts();
    this.fetchCart();
  },
  watch: {
    cart() {
      if (this.cart.line_items.length) {
        this.generateCheckoutToken();
      }
    },
  },
  methods: {
    fetchMerchantDetails() {
      this.$commerce.merchants.about().then((merchant) => {
        this.merchant = merchant;
      }).catch((error) => {
        console.log('There was an error fetch the merchant details', error)
      });
    },
    /**
     * Fetch products data from Chec and stores in the products data object.
     * https://commercejs.com/docs/sdk/products
     */
    fetchProducts() {
      this.$commerce.products.list().then((products) => {
        this.products = products.data;
      }).catch((error) => {
        console.log('There was an error fetching products', error);
      });
    },
    /**
     * Toggles the cart
     */
    toggleCart() {
      this.isCartVisible = !this.isCartVisible;
    },
    /**
     * Close cart when routing to checkout
     */
    handleNavigateTocheckout() {
      this.$router.push('/checkout')
      this.isCartVisible = false;
    },
    /**
     * Retrieve the current cart or create one if one does not exist
     * https://commercejs.com/docs/sdk/cart
     */
    fetchCart() {
      this.$commerce.cart.retrieve().then((cart) => {
        this.cart = cart
      }).catch((error) => {
        console.log('There was an error fetching the cart', error);
      });
    },
    /**
     * Adds a product to the current cart in session
     * https://commercejs.com/docs/sdk/cart/#add-to-cart
     *
     * @param {string} productId The ID of the product being added
     * @param {number} quantity The quantity of the product being added
     */
    handleAddToCart(productId, quantity) {
      this.$commerce.cart.add(productId, quantity).then((item) => {
        this.cart = item.cart;
      }).catch((error) => {
        console.log('There was an error fetching the cart', error);
      });
    },
    /**
     * Removes line item from cart
     * https://commercejs.com/docs/sdk/cart/#remove-from-cart
     *
     * @param {string} lineItemId ID of the line item being removed
     *
     */
    handleRemoveFromCart(lineItemId) {
      this.$commerce.cart.remove(lineItemId).then((resp) => {
        this.cart = resp.cart;
      }).catch((error) => {
        console.log('There was an error updating the cart items', error);
      });
    },
    /**
     * Empties cart contents
     * https://commercejs.com/docs/sdk/cart/#remove-from-cart
     */
    handleEmptyCart() {
      this.$commerce.cart.empty().then((resp) => {
        this.cart = resp.cart;
      }).catch((error) => {
        console.log('There was an error clearing your cart', error);
      });
    },
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
    /**
     * Generates a checkout token
     * https://commercejs.com/docs/sdk/checkout#generate-token
     */
    generateCheckoutToken() {
      this.$commerce.checkout.generateToken(this.cart.id, { type: 'cart' }).then((token) => {
        this.checkoutToken = token;
      }).catch((error) => {
        console.log('There was an error in generating a token', error);
      });
    },
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
        this.isNavVisible = false;
      }).catch((error) => {
          console.log('There was an error confirming your order', error);
      });
    },
    /**
     * Set isNavVisible on routing back to home
     */
    handleBackToHome() {
      this.isNavVisible = true;
    }
  }
};
</script>

<style lang="scss">
.nav {
  @apply fixed;
  top: 1rem;
  right: 1.25rem;
  z-index: 999;

  &__cart {
    span {
      @apply text-sm font-bold bg-orange text-white py-0 px-1 -ml-2 rounded-full align-top;
    }
  }

  &__cart-close {
    @apply bg-blue text-white py-0 px-1 -ml-2 -mt-3 -mr-3 rounded-full align-top h-8 w-8;
  }
}
</style>
