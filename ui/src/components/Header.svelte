<script>
  export let params;
  const shopId = params.shopId;
  const orderId = params.orderId;
  const shop = params.shop  
</script>

<style>
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em !important;
    font-weight: 100;
    text-align: center;
  }

  a, a:visited, a:hover {
    color: #ff3e00;
    text-decoration: none;
  }
</style>

<h1>
  <a href="/{shopId}">{shop.title}</a>
</h1>