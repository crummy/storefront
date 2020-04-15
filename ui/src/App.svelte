<script>
  import router from "page";
  import Shop from "./routes/Shop.svelte";
  import Order from "./routes/Order.svelte";
  import Welcome from "./routes/Welcome.svelte";
  import Cancel from "./routes/Cancel.svelte";

  let page;
  let params;

  router("/", () => (page = Welcome));

  router(
    "/:shopId",
    (ctx, next) => {
      params = ctx.params;
      next();
    },
    () => (page = Shop)
  );

  router(
    "/:shopId/order/:orderId",
    (ctx, next) => {
      params = ctx.params;
      next();
    },
    () => {
      page = Order;
    }
  );

  router(
    "/:shopId/order/:orderId/cancel",
    (ctx, next) => {
      params = ctx.params;
      next();
    },
    () => {
      page = Cancel;
    }
  );
  router.start();
</script>

<style>
  :global(main) {
    max-width: 800px;
    margin: 0 auto;
  }

  :global(h1) {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em !important;
    font-weight: 100;
    text-align: center;
  }

  :global(h2) {
    background-color: #ffc4b0;
    padding: 1em;
    text-align: center;
  }
</style>

<svelte:component this={page} {params} />

<link
  rel="stylesheet"
  href="https://unpkg.com/purecss@1.0.1/build/pure-min.css"
  integrity="sha384-oAOxQR6DkCoMliIh8yFnu25d7Eq/PHS21PClpwjOTeU2jRSq11vu66rf90/cZr47"
  crossorigin="anonymous" />
