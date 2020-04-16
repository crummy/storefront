<script>
  import router from "page";
  import Shop from "./routes/Shop.svelte";
  import Order from "./routes/Order.svelte";
  import Welcome from "./routes/Welcome.svelte";
  import Cancel from "./routes/Cancel.svelte";
  import { getShop, getOrder } from "./api";
  import { parseQuery } from "./queryString"

  let page;
  let params = {}

  const loadShop = (ctx, next) => {
    params.shopId = ctx.params.shopId
    getShop(params.shopId).then(result => {
      params.shop = { goods: result.goods, shippingCosts: result.shippingCosts, id: result.id, ...result.fields }
      document.title = result.fields.title
      next();
    });
  };

  const loadOrder = (ctx, next) => {
    params.orderId = ctx.params.orderId
    getOrder(params.shopId, params.orderId).then(order => {
      params.order = order
      next();
    });
  };

  const loadQueryString = (ctx, next) => {
    const queryParams = parseQuery(ctx.querystring)
    params = { ...params, queryParams }
    next()
  }

  router("/", () => (page = Welcome));
  router("/:shopId/*", loadShop);
  router("/:shopId", loadShop, () => (page = Shop));
  router("/:shopId/order/:orderId", loadOrder, loadQueryString, () => (page = Order));
  router("/:shopId/order/:orderId/cancel", loadOrder, () => (page = Cancel));

  router.start();
</script>

<style>
  :global(main) {
    max-width: 800px;
    margin: 0 auto;
  }

  :global(.message) {
    background-color: #ffc4b0;
    padding: 1em;
    text-align: center;
  }
</style>

<svelte:head>
	<title>storefront.nz</title>
</svelte:head>
<svelte:component this={page} {params} />

<link
  rel="stylesheet"
  href="https://unpkg.com/purecss@1.0.1/build/pure-min.css"
  integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47"
  crossorigin="anonymous" />
