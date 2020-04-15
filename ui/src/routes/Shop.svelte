<script>
  import { onMount } from "svelte";
  import { getShop, checkout } from "../api";

  export let params;
  export const shopId = params.shopId;
  export let shop = { title: "Loading...", goods: [] };
  let email = "",
    error;

  $: total = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  onMount(async () => {
    getShop(shopId).then(
      result => (shop = { goods: result.goods, ...result.fields })
    );
  });

  const handleCheckout = async () => {
    const response = await checkout(shopId, shop.goods);
    const json = await response.json();
    var stripe = Stripe("pk_test_aXZARMk1T9r3c3JMbUMkoTRW009LogMzaN");
    stripe
      .redirectToCheckout({
        sessionId: json.sessionId
      })
      .then(function(result) {
        error = result.error.message;
      });
  };
</script>

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
            <input type="number" bind:value={good.quantity} />
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
        <input id="email" type="email" bind:value={email} />
      </div>
    </fieldset>
    <button type="submit" class="pure-button">Checkout</button>
  </form>
</main>
