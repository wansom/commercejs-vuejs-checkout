<template>
   <div class="checkout">
        <h3>Checkout</h3>
        <form class="checkout__form">
            <h4 class="checkout__subheading">Customer Information</h4>

                <label class="checkout__label" for="customerFirstName">First Name</label>
                <input class="checkout__input" type="text" v-model="form.customer.firstName" name="customerFirstName" placeholder="Enter your first name" required />

                <label class="checkout__label" for="customerLastName">Last Name</label>
                <input class="checkout__input" type="text" v-model="form.customer.lastName" name="customerLastName" placeholder="Enter your last name" required />

                 <label class="checkout__label" for="customerEmail">Email</label>
                <input class="checkout__input" type="text" v-model="form.customer.email" name="customerEmail" placeholder="Enter your email" required />

            <h4 class="checkout__subheading">Shipping Details</h4>

                <label class="checkout__label" for="street">Full Name</label>
                <input class="checkout__input" type="text" v-model="form.shipping.name" name="shippingName" placeholder="Enter your shipping full name" required />

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
        <div>
            <h4>Order Summary</h4>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Checkout',
    props: ['cart', 'checkoutToken'],
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
            shippingOptions: [],
            shippingSubdivisions: {},
            countries: {},
            order: null
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
        this.fetchShippingOptions(this.checkoutToken.id, this.form.shipping.country);
    },
    methods: {
        /**
         * Fetches the countries available to ship to current checkout
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
         * 
         * @returns
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
        fetchShippingOptions(){
            this.$commerce.checkout.getShippingOptions(this.checkoutToken.id, { country: 'US', region: 'CA' }).then((options) => {
                this.shippingOptions = options;
              }).catch((error) => {
                console.log('There was an error fetching the shipping methods', error);
            });
        },
        confirmOrder(){
            const orderData = {
                // line_items: this.checkoutToken.live.line_items,
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
    }
}
</script>

<style lang="scss">
.checkout {
    &__form {
        @apply bg-white border-2 border-blue w-3/5 p-5 m-12;
    }

    &__subheading {
        @apply text-lg font-bold pt-4;
    }

    &__label {
        @apply block text-xs font-bold text-blue uppercase pt-3;
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
       @apply bg-blue border border-blue pl-5 mx-5 mb-5 py-2 px-3 text-xs uppercase text-white font-bold;


        &:hover {
            background-color: lighten(#292B83, 10);
        }
    }
}

</style>