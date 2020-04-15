<script>
  import { onMount } from "svelte";
  import { cancel, getShop } from "../api";

  export let params;
  export const shopId = params.shopId;
  export const orderId = params.orderId;
  let shop;

  onMount(async () => {
    getShop(shopId).then(
      result => (shop = { ...result.fields })
    );
    cancel(orderId)
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

{#if shop}
<main>
  <h1>shop.title</h1>
  <h2>Order cancelled</h2>
</main>