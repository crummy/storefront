<script>
  import { checkout } from "../api";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  export let params;
  export const shopId = params.shopId;
  export const shop = params.shop;
  let error;
  let selectedShippingOption,
    shippingTotal = "";
  let isNoteVisible = false;
  let note = "";
  let phoneNumber = "";
  let boxesToShip = 0;

  const formatPrice = (price) => '$' + Number(price).toFixed(2);

  $: subtotal = shop.goods
    .map(good => good.price * (good.quantity ? good.quantity : 0))
    .reduce((a, b) => a + b, 0);

  $: total = subtotal + shippingTotal;

  $: {
    if (selectedShippingOption) {
      const kilosToShip = shop.goods
        .map(good => (good.quantity ? good.quantity : 0))
        .reduce((a, b) => a + b, 0);
      boxesToShip = Math.round((kilosToShip - 1) / selectedShippingOption.kgPerBox + 0.5);
      shippingTotal = boxesToShip * selectedShippingOption.pricePerBox;
    }
  }

  const handleCheckout = async () => {
    if (subtotal == 0) {
      error = "No items have been selected";
      return;
    } else if (selectedShippingOption === undefined) {
      error = "Please select a shipping option";
      return;
    }
    document.querySelector("#checkoutButton").classList.add("pure-button-disabled");
    const order = {
      goods: shop.goods.filter(good => good.quantity > 0),
      shipping: selectedShippingOption.name,
      note,
      phoneNumber
    };
    const response = await checkout(shopId, order);
    const json = await response.json();
    if (!response.ok) {
      const reason = json.error ? json.error : "An unknown error occurred";
      error = `Checkout failed: ${reason}`;
      return;
    }
    const stripe = Stripe(json.stripeKey);
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

  .itemList {
    display: grid;
    grid-template-columns: auto 100px;
    align-items: center;
    align-content: space-evenly;
    border-bottom: 1px solid lightgray;
    grid-row-gap: 1.5em;
    padding-bottom: 1.5em;
    margin: 2em;
  }

  .title {
    font-weight: bold;
  }

  .comment {
    font-size: 0.9em;
    font-style: italic;
  }

  .header {
    color: gray;
    font-weight: bold;
    font-size: 0.8em;
    border-bottom: 1px solid lightgray;
  }

  .totalList {
    display: grid;
    grid-template-columns: auto 100px;
    grid-row-gap: 0.5em;
    background-color: lightgray;
    padding: 2em;
    margin: 2em;
  }

  .value {
    text-align: center;
  }

  .total {
    font-weight: bold;
  }

  .item {
    font-size: 1.2em;
  }

  .quantity {
    text-align: right;
  }

  .quantityContainer {
    text-align: right;
  }

  .quantityInput {
    width: 100%;
    text-align: center;
    border: 1px solid black;
    background-color: whitesmoke;
  }

  #checkoutButton {
    padding: 1em;
    width: 10em;
    grid-column: span 2;
    margin: 0 auto;
  }

  .splash-image {
    max-width: 800px;
  }

  .splash-image img {
    max-width: inherit;
  }

  .order-form {
    padding-top: 1em;
  }

  h3 {
    font-weight: normal;
  }

  .add-note button {
    all: unset;
    cursor: pointer;
    color: blue;
    border-bottom: 1px dashed blue;
  }

  .note textarea {
    width: 100%;
  }
</style>

<svelte:options accessors={true} />
<main>
  <script src="https://js.stripe.com/v3/">

  </script>
  <Header shopId={shop.id} title={shop.title} subtitle={shop.subtitle} logo={shop.logo}/>
  {#if shop.message && !error}
    <div class="message">{shop.message}</div>
  {/if}
  {#if shop.note}
    <h3>{@html shop.note.replaceAll("\n", "<br />")}</h3>
  {/if}
  {#if shop.splashImage}
    <div class="splash-image"><img alt="splash" src={shop.splashImage}/></div>
  {/if}
  {#if error}
    <div class="message error">{error}</div>
  {/if}
  <form
    class="pure-form pure-form-aligned order-form"
    on:submit|preventDefault={handleCheckout}>
    <div class="itemList">
      <div class="header">Item</div>
      <div class="header quantity">Quantity</div>
      {#each shop.goods as good}
        <div class="item">
          <span class="title">{good.name}</span>, {formatPrice(good.price)}/{good.unit}
          {#if good.comment}
            <div class="comment">{good.comment}</div>
          {/if}
        </div>
        <div class="quantityContainer">
          <input
            type="number"
            class="quantityInput"
            bind:value={good.quantity}
            min="0" />
        </div>
      {/each}
    </div>
    <div class="totalList">
      {#if shop.shippingCosts}
        <div class="label">Subtotal</div>
        <div class="value">{formatPrice(subtotal)}</div>

        <div class="label">
          Delivery to:
          <select id="shippingOption" bind:value={selectedShippingOption}>
            <option value={undefined} disabled>Choose a shipping option</option>
            {#each shop.shippingCosts as shippingOption}
              <option value={shippingOption}>{shippingOption.name}</option>
            {/each}
          </select>
        </div>
        <div class="value">
          {#if shippingTotal}
            {formatPrice(shippingTotal)}
            {#if boxesToShip > 1}
              &nbsp;({boxesToShip} boxes)
            {/if}
          {/if}
        </div>
      {/if}

      <div class="label total">Total</div>
      <div class="value total">{formatPrice(total)}</div>
      <div>
        Phone number:
        <input type="text" bind:value={phoneNumber}/>
      </div>
      <div></div>

      {#if isNoteVisible}
        <div class="note"><textarea bind:value={note} placeholder="Add a note"></textarea></div>
      {:else}
        <div class="add-note"><button type="button" on:click|once={() => isNoteVisible = true}>Add a note...</button></div>
      {/if}
      <button type="submit" class="pure-button" id="checkoutButton">
        Purchase
      </button>
    </div>
  </form>
  {#if shop.footer}
    <Footer message={shop.footer} />
  {/if}
</main>
