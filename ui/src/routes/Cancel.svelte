<script>
  import { onMount } from "svelte";
  import { cancel, getShop } from "../api";
  import Header from '../components/Header.svelte'

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
  <Header params={params} />
  <h2>Order cancelled.</h2>
</main>
{/if}