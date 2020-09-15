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

                <label class="checkout__label" for="postalZip">Postal/Zip Code</label>
                <input class="checkout__input" type="text" v-model="form.shipping.postalZip" name="postalZip" placeholder="Enter your postal/zip code" required />

                <label class="checkout__label" for="postalZip">Country</label>
                <select v-model="form.shipping.country" name="country" class="checkout__select">
                <option value="" disabled>Country</option>
                <option v-for="(country, index) of shippingCountries" :value="index" :key="index">{{country}}</option>
                </select>
                
                <label class="dcheckout__label" for="postalZip">Province/State</label>
                <select v-model="form.shipping.provinceState" name="provinceState" class="checkout__select">
                <option value="" disabled>Province/State</option>
                <option v-for="(subdivision, index) of shippingSubdivisions" :value="index" :key="index">{{subdivision}}</option>
                </select>

                <label class="checkout__label" for="city">Shipping Method</label>
                <select v-model="form.fulfillment.shippingMethod" name="shippingMethod" class="checkout__select">
                <option value="" disabled>Select a shipping method</option>
                <option v-for="method of shippingMethods" :value="method.id" :key="method.id">{{ `${method.description} - $${method.price.formatted_with_code}` }}</option>
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

            <button class="checkout__btn-confirm" @click.prevent="confirmOrder()">Confirm Order</button>
            
        </form>
    </div>
</template>

<script>
export default {
    name: 'Checkout',
    props: ['checkoutToken', 'cart'],
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
                    city: 'Vancouver',
                    stateProvince: 'BC',
                    postalZipCode: 'V1A 2B3',
                    country: 'CA',
                },
                fulfillment: {
                    shippingMethod: '',
                    shippingMethods: [],
                    shippingMethodsId: {},
                    shippingSubdivisions: {},
                    shippingCountries: {},
                },
                payment: {
                    cardNum: '4242 4242 4242 4242',
                    expMonth: '01',
                    expYear: '2023',
                    ccv: '123',
                    billingPostalZip: 'V1A 2B3',
                },
            }
        }
    },
    created() {
        this.fetchShippingCountries();
        this.fetchProvinceState(this.country);
        this.fetchShippingMethods(this.checkoutToken.id, this.country);
    },
    methods: {
        getShippingCountries(){
            this.$commerce.services.localeListShippingCountries(this.checkoutToken.id).then((resp) => {
                    this.shippingCountries = resp.countries
            }).catch((error) => {
                console.log('There was an error fetching the shipping countries', error);
            });
        },
        getProvinceState(){
            this.commerce.services.localeListSubdivisions(this.country).then((resp) => 
                this.shippingSubdivisions = resp.subdivisions
            )
            .catch((error) => {
            alert(error)
            })
        },
        getShippingMethods(){
            this.commerce.checkout.getShippingOptions(this.checkout.id, { country: 'CA', region: 'BC' }).then(response => this.shippingMethods = response
            )
            .catch((error) => {
                alert(error)
            })
        },
    }
}
</script>

<style lang="scss">
.checkout {
    &__form {
        @apply bg-white border-2 border-blue w-1/2 p-5;
    }

    &__input {
        @apply border border-blue;
    }
}

</style>