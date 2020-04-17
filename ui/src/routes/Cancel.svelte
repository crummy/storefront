<script>
  import { onMount } from "svelte";
  import { cancel, getShop } from "../api";
  import Header from '../components/Header.svelte'

  export let params;
  const shopId = params.shopId;
  const orderId = params.orderId;
  const shop = params.shop
  onMount(async () => {
    cancel(shopId, orderId)
  });
</script>

{#if shop}
<main>
  <Header shopId={shop.id}, title={shop.title} subtitle={shop.subtitle} />
  <h2>Order cancelled.</h2>
</main>
{/if}