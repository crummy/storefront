<script>
  import { checkout } from "../api";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  export let params;
  export const shopId = params.shopId;
  export const shop = params.shop;
  let email = "",
    error;
  let selectedShippingOption,
    shippingTotal = "";

  $: subtotal = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  $: total = subtotal + shippingTotal;

  $: {
    if (selectedShippingOption) {
      const kilosToShip = shop.goods
        .map(good => (good.quantity ? good.quantity : 0))
        .reduce((a, b) => a + b, 0);
      const boxesToShip = Math.round(
        kilosToShip / selectedShippingOption.kgPerBox + 0.5
      );
      shippingTotal = boxesToShip * selectedShippingOption.pricePerBox;
    }
  }

  const handleCheckout = async () => {
    if (subtotal == 0) {
      error = "No items have been selected";
      return
    }
    document.querySelector("#checkoutButton").classList.add("disabled");
    const order = {
      goods: shop.goods.filter(good => good.quantity > 0),
      email,
      shipping: selectedShippingOption.name
    };
    const response = await checkout(shopId, order);
    const json = await response.json();
    if (!response.ok) {
      const reason = json.error ? json.error : "An unknown error occurred"
      error = `Checkout failed: ${reason}`
      return
    }
    var stripe = Stripe(json.stripeKey);
    stripe
      .redirectToCheckout({
        sessionId: json.sessionId
      })
      .then(function(result) {
        error = result.error.message;
      });
  };
</script>

<style>
  .quantityInput {
    width: 6em;
  }

  .error {
    background-color: red;
  }

  .menu {
    display: grid;
    grid-template-columns: 80% 20%;
    align-items: center;
  }

  .title {
    font-weight: bold;
  }

  .comment {
    font-size: 0.9em;
  }

  .header {
    color: gray;
    font-weight: bold;
    font-size: 0.8em;
    border-bottom: 1px solid lightgray;
  }

  .subTotalLabel,
  .totalLabel,
  .shippingTotalLabel {
    padding-left: 30%;
  }

  .totalLabel,
  .total {
    font-weight: bold;
  }

  .item {
    vertical-align: center;
    font-size: 1.2em;
    height: 3em;
  }

  .quantity {
    text-align: right;
  }
</style>

<svelte:options accessors={true} />
<main>
  <script src="https://js.stripe.com/v3/">

  </script>
  <Header shopId={shop.id} title={shop.title} subtitle={shop.subtitle} />
  {#if shop.message && !error}
    <div class="message">{shop.message}</div>
  {/if}
  {#if error}
    <div class="message error">{error}</div>
  {/if}
  <form
    class="pure-form pure-form-aligned"
    on:submit|preventDefault={handleCheckout}>
    <div class="menu">
      <div class="header">Item</div>
      <div class="header quantity">Quantity</div>
      {#each shop.goods as good}
        <div class="item">
          <span class="title">{good.name}</span>, ${good.price}/{good.unit}
          {#if good.comment}
            <div class="comment">{good.comment}</div>
          {/if}
        </div>
        <div>
          <input
            type="number"
            class="quantityInput"
            bind:value={good.quantity} />
        </div>
      {/each}
      {#if shop.shippingCosts}
        <div class="subTotalLabel">Subtotal</div>
        <div class="subTotal">${subtotal}</div>

        <div class="shippingTotalLabel">
          Delivery to:
          <select id="shippingOption" bind:value={selectedShippingOption}>
            {#each shop.shippingCosts as shippingOption}
              <option value={shippingOption}>{shippingOption.name}</option>
            {/each}
          </select>
        </div>
        <div class="shippingTotal">
          {#if shippingTotal}${shippingTotal}{/if}
        </div>
      {/if}

      <div class="totalLabel">Total</div>
      <div class="total">${total}</div>

      <div>
        <fieldset>
          <div class="pure-control-group">
            <label for="email">Email:</label>
            <input id="email" type="email" bind:value={email} required />
          </div>
        </fieldset>
      </div>
    </div>
    <button type="submit" class="pure-button" id="checkoutButton">
      Checkout
    </button>
  </form>
  {#if shop.footer}
    <Footer message={shop.footer} />
  {/if}
</main>
