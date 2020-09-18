<template>
    <div class="confirmation">
        <div class="confirmation__message">
            Thank you for your purchase, {{ order.customer.firstname }} {{ order.customer.lastname }}
            {{ order.customer_reference}}
        </div>
        <div class="confirmation__reference">
            Order ref: {{ order.customer_reference }}
            {{ order.line_items }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'Confirmation',
    props: ['order']

}
</script>

<style>

</style>