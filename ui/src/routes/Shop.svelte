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
  table {
    width: 100%;
  }

  .quantityInput {
    width: 6em;
  }

  .error {
    background-color: red;
  }
</style>

<svelte:options accessors={true} />
<main>
  <script src="https://js.stripe.com/v3/">

  </script>
  <Header shopId="{shop.id}," title="{shop.title}" subtitle={shop.subtitle} />
  {#if shop.message && !error}
    <div class="message">{shop.message}</div>
  {/if}
  {#if error}
    <div class="message error">{error}</div>
  {/if}
  <form
    class="pure-form pure-form-aligned"
    on:submit|preventDefault={handleCheckout}>
    <table class="pure-table pure-table-bordered">
      {#each shop.goods as good}
        <tr>
          <td>{good.name}</td>
          <td>${good.price}/{good.unit}</td>
          <td>
            <input
              type="number"
              class="quantityInput"
              bind:value={good.quantity} />
          </td>
        </tr>
      {/each}
      {#if shop.shippingCosts}
        <tr>
          <td>Shipping</td>
          <td>
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
          </td>
          <td>${shippingTotal}</td>
        </tr>
      {/if}
      <tr>
        <th>Total</th>
        <th />
        <th>${total}</th>
      </tr>
    </table>
    <fieldset>
      <div class="pure-control-group">
        <label for="email">Email:</label>
        <input id="email" type="email" bind:value={email} required />
      </div>
    </fieldset>
    <button type="submit" class="pure-button" id="checkoutButton">
      Checkout
    </button>
  </form>
  {#if shop.footer}
    <Footer message={shop.footer} />
  {/if}
</main>
