<template>
  <div class="checkout">
    <h2 class="checkout__heading">Checkout</h2>
    <div class="checkout__wrapper">
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
              <option class="checkout__select-option" v-for="(method, index) in shippingOptions" :value="method.id" :key="index">{{ `${method.description} - $${method.price.formatted_with_code}` }}</option>
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

          <button class="checkout__btn-confirm" @click.prevent="confirmOrder">
            {{ loading ? 'Loading...' : 'Confirm Order' }}
          </button>
      </form>
      <div class="checkout__summary">
        <h4>Order Summary</h4>
          <div
            v-for="lineItem in cart.line_items"
            :key="lineItem.id"
            class="checkout__summary-details"
          >
            <img class="checkout__summary-img" :src="lineItem.media.source" />
            <p class="checkout__summary-name">{{ lineItem.quantity }} x {{ lineItem.name }}</p>
            <p class="checkout__summary-value">{{ lineItem.line_total.formatted_with_symbol }}</p>
          </div>
          <div class="checkout__summary-total">
            <p class="checkout__summary-price">
              <span>Subtotal:</span>
              {{ liveObject.total_due.formatted_with_symbol }}
            </p>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import CartItem from '../components/CartItem';

export default {
    name: 'Checkout',
    props: ['checkoutToken', 'cart'],
    components: {
      CartItem,
    },
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
            loading: false,
            liveObject: {},
            shippingOptions: [],
            shippingSubdivisions: {},
            countries: {},
        }
    },
    created() {
        this.fetchAllCountries();
        this.fetchStateProvince(this.form.shipping.country);
    },
    mounted() {
        if(this.checkoutToken == null) {
            return;
        }
        this.fetchShippingOptions(this.checkoutToken.id, this.form.shipping.country, this.form.shipping.stateProvince);
        this.getLiveObject(this.checkoutToken.id);
    },
    methods: {
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
        /**
         * Fetches the available shipping methods for the current checkout
         */
        fetchShippingOptions(checkoutToken, country, stateProvince){
          this.$commerce.checkout.getShippingOptions(checkoutToken,
            { country: country, region: stateProvince }).then((options) => {
              this.shippingOptions = options;
            }).catch((error) => {
              console.log('There was an error fetching the shipping methods', error);
          });
        },
        /**
         * Checks and validates the shipping method
         * https://commercejs.com/docs/api/?javascript--cjs#check-shipping-method
         */
        validateShippingOption(shippingOptionId) {
          this.commerce.checkout.checkShippingOption(this.checkoutToken.id, {
            shipping_option_id: shippingOptionId,
            country: this.form.shipping.country,
            region: this.form.shipping.stateProvince
          }).then((shippingOption) => {
            this.fulfillment.selectedShippingOption = shippingOption.id;
            this.getLiveObject();
          }).catch((error) => {
            console.log('There was an error setting the shipping option', error);
          })
        },
        setSelectedShippingOption() {
          this.validateShippingOption(this.form.fulfillment.selectedShippingOption);
        },
        /**
         * Emits order data to capture the order
         */
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
            this.loading = true;
            this.$emit('confirm-order', this.checkoutToken.id, orderData);
        }
    }
}
</script>

<style lang="scss">
.checkout {

  &__wrapper {
    @apply flex justify-center;
  }

  &__heading {
    @apply mt-10 ml-12 text-grey;
  }

    &__form {
        @apply bg-white border-2 border-blue w-1/2 py-6 px-8 m-12 mt-6;
    }

    &__subheading {
      @apply text-lg font-bold text-blue;

      &:not(:first-child) {
        @apply pt-5;
      }
    }

    &__label {
        @apply block text-xs font-bold text-grey uppercase pt-3;
    }

    &__input {
      @apply border border-blue py-1 px-2 text-sm;
    }

    &__select {
      @apply border border-blue py-1 px-2;

      select > option {
        @apply text-sm;
      }
    }

    &__btn-confirm {
       @apply bg-blue border border-blue pl-5 py-2 px-3 text-xs uppercase text-white font-bold block mt-6;

        &:hover {
            background-color: lighten(#292B83, 10);
        }
    }

    &__summary {
      @apply mt-6 border-2 border-blue w-1/5 py-6 px-8;
      height: max-content;

      h4 {
        @apply font-bold text-blue;
      }
    }

    &__summary-details {
      @apply flex my-3;
    }

    &__summary-img {
       @apply w-16 h-16 border-2 object-cover mr-3;
    }

    &__summary-name {
      @apply text-blue;
    }

    &__summary-value {
      @apply ml-auto;
    }

    &__summary-price {
      @apply mr-auto justify-end;

      span {
        @apply font-bold;
      }
    }
}

</style>
