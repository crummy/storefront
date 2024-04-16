import {Good, get as getShop, Shop} from './shop'
import Stripe from 'stripe';
import {put as putOrder} from './order'
import {get as getShopConfig} from './shopConfig'
import {HttpError} from './error'

export interface OrderedGood extends Good {
    quantity: number
}

const baseUrl = process.env.WEBSITE_BASE_URL!!

interface CreateOrderResponse {
    sessionId: string,
    orderId: string
}

export const createOrder = async (shopId: string, goods: OrderedGood[], shipping: string, note: string, phoneNumber: string): Promise<CreateOrderResponse> => {
    const shopConfig = await getShopConfig(shopId)
    if (!shopConfig) {
        throw new HttpError(`No shop found: ${shopId}`, 404)
    }
    const shop = (await getShop(shopId))!
    verifyPrices(shop, goods)
    const shippingCost = calculateShipping(shop, goods, shipping)

    const stripe = new Stripe(shopConfig.stripeSecretKey, {apiVersion: '2020-03-02'});

    const orderId = await putOrder({goods, shopId, note, created: new Date(), shippingCost, shipping, phoneNumber})

    const lineItems = goods.map(good => (good.discountThreshold && good.discount && good.quantity > good.discountThreshold ? {
        name: `${good.name} (bulk discount)`,
        amount: good.price * 100 * (1 - good.discount),
        currency: 'nzd',
        quantity: good.quantity
    } : {
        name: good.name,
        amount: good.price * 100,
        currency: 'nzd',
        quantity: good.quantity
    }))
    const shippingLineItem = {
        name: `Shipping: ${shipping}`,
        amount: Math.round(shippingCost * 100),
        currency: 'nzd',
        quantity: 1
    }

    const successUrl = `${baseUrl}/${shopId}/order/${orderId}?sessionId={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${shopId}/order/${orderId}/cancel`;
    return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [...lineItems, shippingLineItem],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: orderId,
        shipping_address_collection: {
            allowed_countries: ['NZ'],
        },
    }).then(session => ({
        sessionId: session.id,
        orderId,
        stripeKey: shopConfig.stripeKey,
    }))
}

const verifyPrices = (shop: Shop, goods: OrderedGood[]) => {
    const goodsMatch = goods.every(good =>
        shop.goods.some(g =>
            g.name == good.name
            && g.unit == good.unit
            && g.price == good.price
            && g.discount == good.discount
            && g.discountThreshold == good.discountThreshold
        )
    )
    if (!goodsMatch) {
        console.log("Tried to buy illegal goods", goods)
        throw new HttpError("Unable to purchase goods", 409)
    }
}

const calculateShipping = (shop: Shop, goods: OrderedGood[], selectedOption: string) => {
    const shipping = shop.shippingCosts.find(option => option.name == selectedOption)
    if (!shipping) {
        throw new HttpError(`Could not calculate shipping for ${selectedOption}`, 409)
    }
    const kilosToShip = goods.map(good => good.quantity)
        .reduce((a, b) => a + b, 0);
    const boxesToShip = Math.round((kilosToShip - 1) / shipping.kgPerBox + 0.5);
    return boxesToShip * shipping.pricePerBox;
}
