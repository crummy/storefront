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
    cancel(shopId, orderId)
  });
</script>

{#if shop}
<main>
  <h1>{shop.title}</h1>
  <h2>Order cancelled</h2>
</main>
{/if}