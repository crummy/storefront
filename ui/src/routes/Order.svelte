<script>
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
  .order {
    display: grid;
    grid-template-columns: 60% 20% 20%;
    align-items: center;
    grid-row-gap: 8px;
  }

   .header {
    color: gray;
    font-weight: bold;
    font-size: 0.8em;
    border-bottom: 1px solid lightgray;
  }

  .footer {
    font-weight: bold;
  }

  .totalLabel {
    grid-column: span 2
  }

  .note {
    font-style: italic;
  }
</style>

<main>
  <Header shopId={shop.id} title={shop.title} subtitle={shop.subtitle} logo={shop.logo}/>
  {#if message}
    <div class="message">{message}</div>
  {/if}
  <div class="order">
      <div class="header">Item</div>
      <div class="header">Quantity</div>
      <div class="header">Price</div>
    {#each order.goods as good}
      <div>{good.name}</div>
      <div>
        {good.quantity} {good.unit}{#if good.quantity !== 1}s{/if}
      </div>
      <div>${good.price * good.quantity}</div>
    {/each}
    <div class="totalLabel footer">Total</div>
    <div class="total footer">${total}</div>
    {#if order.note}
      <div class="note">{order.note}</div>
    {/if}
  </div>
  {#if shop.footer}
    <Footer message={shop.footer} />
  {/if}
</main>
