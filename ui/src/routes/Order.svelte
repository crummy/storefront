<script>
  import { onMount } from "svelte";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  const messages = {
    PENDING_PAYMENT:
      "We have not yet received payment for your order. Please contact us for further assistance",
    PAID: "Your order has been successfully placed",
    CANCELLED: "Your order has been cancelled"
  };

  export let params;
  export const orderId = params.orderId;
  const { shop, order } = params;
  const message = messages[order.state];
  const total = order.goods
    .map(good => good.price * good.quantity)
    .reduce((a, b) => a + b, 0);
</script>

<style>

</style>

<main>
  <Header shopId={shop.id} title={shop.title} subtitle={shop.subtitle} />
  {#if message}
    <h2>{message}</h2>
  {/if}
  <div class="menu">
    <div class="row header">
      <span>Item</span>
      <span>Quantity</span>
      <span>Price</span>
    </div>
    {#each order.goods as good}
      <div class="row">
        <span>{good.name}</span>
        <span>
          {good.quantity} {good.unit}
          {#if good.quantity != 1}s{/if}
        </span>
        <span>${good.price * good.quantity}</span>
      </div>
    {/each}
    <div class="row footer">
      <span>Total</span>
      <span>${total}</span>
    </div>
  </div>
  {#if shop.footer}
    <Footer message={shop.footer} />
  {/if}
</main>
