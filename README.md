# Simple Seller

A simple storefront.

## Purpose

I wanted to create the simplest, cheapest possible web storefront that still
offered flexibility for non-technical users. This is the result:

* Light NodeJS deployed to AWS Lambda for free tier web serving
* Simple Svelte deployed to AWS S3 + Cloudfront for free frontend hosting
* Orders and shop config stored in DynamoDB, also free tier
* Uses Google Sheets as a CMS for easy updating of goods, and viewing orders
* Stripe Checkout handles payments seamlessly

More details on it are here: http://malcolmcrum.com/blog/2020/04/21/storefront.html

## Instructions

Most of the essentials are in Make for easy re-use.

* After editing the UI, `make sync` to rebuild, copy to S3, and invalidate
Cloudfront cache
* After editing the backend, `make deploy` to transpile Typescript and
deploy to AWS
* To add another shop, `make add-shop STAGE=(stage) id=(id) SPREADSHEET_ID=(google spreadsheet ID) STRIPE_PUBLIC_KEY=(stripe public key) STRIPE_SECRET_KEY=(stripe secret key) EMAIL=(email for order confirmations)`

## License

MIT.