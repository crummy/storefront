<script>
  import { checkout } from "../api";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  export let params;
  export const shopId = params.shopId;
  export const shop = params.shop;
  console.log(shop);
  let email = "",
    error;
  let selectedShippingOption,
    shippingTotal = "";

  $: total = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  $: {
    if (selectedShippingOption && total != 0) {
      const shipping = shop.shippingCosts.find(
        option => option.name == selectedShippingOption
      );
      const kilosToShip = shop.goods
        .map(good => (good.quantity ? good.quantity : 0))
        .reduce((a, b) => a + b, 0);
      const boxesToShip = Math.round(kilosToShip / shipping.kgPerBox + 0.5);
      shippingTotal = boxesToShip * shipping.pricePerBox;
    }
  }

  const handleCheckout = async () => {
    if (total == 0) {
      error = "";
    }
    document.querySelector("#checkoutButton").classList.add("disabled");
    const order = {
      goods: shop.goods.filter(good => good.quantity > 0),
      email,
      shipping: selectedShippingOption
    };
    const response = await checkout(shopId, order);
    const json = await response.json();
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
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
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
      <div class="header">Quantity</div>
      <div class="header">Price</div>
      {#each shop.goods as good}
        <div class="item">
          <div class="title">{good.name}</div>
          {#if good.comment}
            <div class="comment">{good.comment}</div>
          {/if}
        </div>
        <div>${good.price}/{good.unit}</div>
        <div>
          <input
            type="number"
            class="quantityInput"
            bind:value={good.quantity} />
        </div>
      {/each}
      {#if shop.shippingCosts}
        <div>Shipping</div>
        <div>
          {#each shop.shippingCosts as shippingOption}
            <label for={shippingOption.name} class="pure-radio">
              <input
                id={shippingOption.name}
                type="radio"
                name="shippingRadio"
                value={shippingOption.name}
                bind:group={selectedShippingOption} />
              {shippingOption.name}
            </label>
          {/each}
        </div>
        <div>
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
