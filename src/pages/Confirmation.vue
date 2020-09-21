<template>
  <div class="confirmation">
    <div class="confirmation__wrapper">
      <div class="confirmation__wrapper-message">
        <h3>Thank you for your purchase, {{ order.customer.firstname }} {{ order.customer.lastname }}!</h3>
        <h4 class="confirmation__wrapper-reference">
          <span>Order ref:</span> {{ order.customer_reference }}
        </h4>
      </div>
      <button @click="backToHome()" class="confirmation__wrapper-back">
        <font-awesome-icon size="1x" icon="arrow-left" color="#292B83"/>
        <span>Back to home</span>
      </button>
    </div>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

library.add(faArrowLeft);

export default {
  name: 'Confirmation',
  props: ['order'],
  methods: {
    backToHome() {
      this.$router.push('/');
      this.$emit('back-to-home');
    }
  }
}
</script>

<style lang="scss">
.confirmation {
  &__wrapper {
    @apply text-center border-2 border-blue bg-white w-1/2 p-8 m-auto mt-20;
  }

  &__wrapper-message {
    h4 {
      @apply mt-1;
    }
    span {
      @apply text-blue font-bold;
    }
  }

  &__wrapper-back {
    @apply text-blue font-bold mt-3;

    span {
      @apply pl-2;
    }
  }
}
</style>
