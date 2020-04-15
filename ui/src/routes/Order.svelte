<script>
  import { onMount } from "svelte";
  import { getOrder } from "../api";

  export let params;
  export const orderId = params.orderId;
  const { shop, order } = params
</script>

<main>
  <h1>{shop.title}</h1>
  <table class="pure-table pure-table-bordered">
  {#each order.goods as good}
    <tr>
      <td>{good.name}</td>
      <td>{good.quantity} {good.unit}</td>
      <td>${good.total}</td>
    </tr>
  {/each}
    <tr>
      <th>Total</th>
      <th />
      <th>{order.total}</th>
    </tr>
  </table>
</main>
