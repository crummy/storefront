<script>
    import router from "page";
    import Shop from "./routes/Shop.svelte";
    import Order from "./routes/Order.svelte";
    import Cancel from "./routes/Cancel.svelte";
    import {getShop, getOrder} from "./api";
    import {parseQuery} from "./queryString"

    let page;
    let params = {}

    const loadShop = (ctx, next) => {
        params.shopId = ctx.params.shopId || "windsong"
        getShop(params.shopId).then(result => {
            params.shop = {goods: result.goods, shippingCosts: result.shippingCosts, id: result.id, ...result.fields}
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
        params = {...params, queryParams}
        next()
    }

    router("/", loadShop, () => (page = Shop));
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
        background-color: palegreen;
        padding: 1em;
        text-align: center;
        margin-bottom: 1em;
        font-size: 2em;
    }
</style>

<svelte:head>
    <title>windsongorchard.nz</title>
</svelte:head>
<svelte:component this={page} {params}/>

<link rel="stylesheet" href="https://unpkg.com/purecss@2.0.5/build/pure-min.css"
      integrity="sha384-G9DpmGxRIF6tpgbrkZVcZDeIomEU22LgTguPAI739bbKytjPE/kHTK5YxjJAAEXC" crossorigin="anonymous">