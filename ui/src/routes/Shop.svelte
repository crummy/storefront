<script>
  import { onMount } from "svelte";
  import { checkout } from "../api";

  export let params;
  export const shopId = params.shopId;
  export const shop = params.shop;
  let email = "",
    error;

  $: total = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  const handleCheckout = async () => {
    const order = {
      goods: shop.goods.filter(good => good.quantity > 0),
      email
    }
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
    width: 100%
  }

  .quantityInput {
    width: 6em;
  }
</style>

<svelte:options accessors={true} />
<main>
  <script src="https://js.stripe.com/v3/">

  </script>
  <h1>{shop.title}</h1>
  {#if shop.message}
    <h2>{shop.message}</h2>
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
            <input type="number" class="quantityInput" bind:value={good.quantity} />
          </td>
        </tr>
      {/each}
      <tr>
        <th>Total</th>
        <th />
        <th>${total}</th>
      </tr>
    </table>
    <fieldset>
      <div class="pure-control-group">
        <label for="email">Email:</label>
        <input id="email" type="email" bind:value={email} required/>
      </div>
    </fieldset>
    <button type="submit" class="pure-button">Checkout</button>
  </form>
</main>
