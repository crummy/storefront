import { PlacedOrder } from './order'
import { ShopConfig } from './shopConfig'
import { Address } from './order'
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
import { OrderedGood } from './checkout'

const websiteBaseUrl = process.env.WEBSITE_BASE_URL!

export const sendOrderNotification = (order: PlacedOrder, shopConfig: ShopConfig): Promise<any> => {
  const link = `${websiteBaseUrl}/${order.shopId}/order/${order.id}`
  const address = addressToString(order.address)
  const goods = goodsToString(order.goods)
  let htmlBody = `<h1>Storefront.nz Order for ${order.shopId}</h1><h2><a href="${link}">Order ID ${order.id}</a></h2>Deliver <b>${goods}</b> via ${order.shipping} to: <br/><a href="mailto:${order.email}">${order.name}</a> (${order.phoneNumber})<br/>, ${address}<br/>`
  let textBody = `Storefront.nz Order for ${order.shopId}\r\nOrder ID ${order.id}\r\nDeliver ${goods} via ${order.shipping} to:\r\n${order.name} - ${order.email} - ${order.phoneNumber}\r\n${address}\r\n`
  if (order.note) {
    htmlBody += `<b>Note:</b> ${order.note}`
    textBody += `Note: ${order.note}`
  }
  const params = new SendEmailCommand({
    Destination: {
      ToAddresses: [shopConfig.email]
    },
    Source: 'crummynz@gmail.com',
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Order placed for ${order.name}`
      }
    }
  })
  const ses = new SESClient({ apiVersion: '2010-12-01' })
  return ses.send(params)
}

const addressToString = (address: Address): string => {
  return `${address.line1}, ${address.line2}, ${address.city}, ${address.state}`
}

const goodsToString = (goods: OrderedGood[]): string => {
  return goods.map(good => `${good.quantity}${good.unit} ${good.name}`).join(', ')
}