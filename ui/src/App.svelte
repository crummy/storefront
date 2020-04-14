<script>
  import router from "page";
  import Shop from "./routes/Shop.svelte";
  import Orders from "./routes/Orders.svelte";

  let page;
	let params;
	
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
      if (!user) {
        router.redirect(`/login`);
      }
      page = Orders;
    }
  );
  router.start();
</script>

<svelte:component this={page} {params} />