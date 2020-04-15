<script>
  import { onMount } from "svelte";

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
  table {
    width: 100%
  }
</style>

<main>
  <h1>{shop.title}</h1>
  {#if message}
    <h2>{message}</h2>
  {/if}
  <table class="pure-table pure-table-bordered">
    {#each order.goods as good}
      <tr>
        <td>{good.name}</td>
        <td>{good.quantity} {good.unit}{#if good.quantity != 1}s{/if}</td>
        <td>${good.price * good.quantity}</td>
      </tr>
    {/each}
    <tr>
      <th>Total</th>
      <th />
      <th>${total}</th>
    </tr>
  </table>
</main>
