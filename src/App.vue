<template>
  <div>
    <Cart
      :cart="cart"
      @remove-from-cart="handleRemoveFromCart"
      @empty-cart="handleEmptyCart"
    />
    <router-view
      :products="products"
      @add-to-cart="handleAddToCart"
      @confirm-order="handleConfirmOrder"
      :checkout-token="checkoutToken"
      :order="order"
    />
  </div>
</template>

<script>
import Cart from './components/Cart';

export default {
  name: 'app',
  components: {
    Cart,
  },
  data() {
    return {
      products: [],
      cart: {},
      checkoutToken: null,
      order: null,
    };
  },
  created() {
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
    /**
     * Fetch products data from Chec and stores in the products data object.
     * https://commercejs.com/docs/sdk/products
     *
     * @return {object} products data object
     */
    fetchProducts() {
      this.$commerce.products.list().then((products) => {
        this.products = products.data;
      }).catch((error) => {
        console.log('There was an error fetching products', error);
      });
    },
    /**
     * Retrieve the current cart or create one if one does not exist
     * https://commercejs.com/docs/sdk/cart
     *
     * @return {object} cart object
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
      this.$commerce.cart.add(productId, quantity).then((resp) => {
        this.cart = resp.cart;
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
        this.cart = resp.newCart
      }).catch((error) => {
        console.log('There was an error refreshing your cart', error);
      });
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
  }
};
</script>
