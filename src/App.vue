<template>
  <div>
    <Cart
      :cart="cart"
      :showCart="showCart"
      @remove-from-cart="handleRemoveFromCart"
      @empty-cart="handleEmptyCart"
    />
    <router-view
      :products="products"
      @add-to-cart="handleAddToCart"
      :cart="cart"
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
      cart: null,
      checkoutToken: null,
    }
  },
  created() {
    this.fetchProducts();
    this.fetchCart();
  },
  watch: {
    cart(newCart) {
      if(newCart.line_items.length) {
        this.generateToken();
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
     * @param {string} id of the product being added
     * @param {number} quantity of the product being added 
     * 
     * @return {object} updated cart object with new line items
     */ 
    handleAddToCart({ productId, quantity }) {
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
     * @param {string} id of the cart line item being removed
     * 
     * @return {object} updated cart object
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
     * 
     * @return {object} updated cart object
     */ 
    handleEmptyCart() {
      this.$commerce.cart.empty().then((resp) => {
        this.cart = resp.cart;
      }).catch((error) => {
        console.log('There was an error clearing your cart', error);
      });
    },
    /**
     * Generates a checkout token
     * https://commercejs.com/docs/sdk/checkout#generate-token
     * 
     * @param 
     */
    generateToken() {
      this.$commerce.checkout.generateToken(this.cart.id, {type: 'cart'}).then((checkout) => {
        this.checkoutToken = checkout;
      }).catch((error) => {
        console.log('There was an error generating your checkout toekn', error);  
      })
    }
  }
};
</script>