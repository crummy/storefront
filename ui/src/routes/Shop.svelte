<script>
  import { onMount } from "svelte";

  export let params;
  export const shopId = params.shopId;
  export let shop = { title: "Loading...", goods: [] };
  let email = "",
		address = "",
    error;
  const baseUrl = process.env.apiUrl

  const getShop = async () => {
    let response = await fetch(`${baseUrl}/shop/${shopId}`);
    return response.json();
  };

  $: total = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  onMount(async () => {
    getShop().then(
      result => (shop = { goods: result.goods, ...result.fields })
    );
  });

  const handleCheckout = async () => {
    const response = await fetch(
      `${baseUrl}/shop/${shopId}/checkout`,
      {
        method: "POST",
        body: JSON.stringify({ goods: shop.goods }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
		);
		const json = await response.json()
    var stripe = Stripe("pk_test_aXZARMk1T9r3c3JMbUMkoTRW009LogMzaN");
    stripe
      .redirectToCheckout({
        sessionId: json.id
      })
      .then(function(result) {
        error = result.error.message
      });
  };
</script>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    text-align: center;
  }

  h2 {
    background-color: #ffc4b0;
    padding: 1em;
    text-align: center;
  }
</style>

<svelte:options accessors={true} />
<link
  rel="stylesheet"
  href="https://unpkg.com/purecss@1.0.1/build/pure-min.css"
  integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47"
  crossorigin="anonymous" />
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
        <label for="address">Address:</label>
        <textarea id="address" bind:value={address} />
      </div>
      <div class="pure-control-group">
        <label for="email">Email:</label>
        <input id="email" type="email" bind:value={email} />
      </div>
    </fieldset>
    <button type="submit" class="pure-button">Checkout</button>
  </form>
</main>
