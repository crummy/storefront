STACK_NAME := "simple-sell-ui"
BUCKET = $(shell aws cloudformation --region us-east-1 describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
CLOUDFRONT_ID = $(shell aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)

# Has to be run against us-east-1 because that's where cloudfront lives
deploy-cloudformation:
	aws --region us-east-1 cloudformation deploy --template-file cloudformation/s3-website.yml --stack-name $(STACK_NAME) --parameter-overrides DomainName="storefront.nz"

sync:
	cd ui && npm run build && cd - && \
	aws --region us-east-1 s3 cp --recursive --acl "public-read" ./ui/public s3://$(BUCKET)/ && \
	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"

add-shop:
	test -n "$(STAGE)"
	test -n "$(ID)"
	test -n "$(SPREADSHEET_ID)"
	test -n "$(STRIPE_PUBLIC_KEY)"
	test -n "$(STRIPE_SECRET_KEY)"
	test -n "$(EMAIL)"
	aws dynamodb put-item --table-name shop-config-$(STAGE) --item '{"id": {"S": "$(ID)"}, "email": {"S": "$(EMAIL)"}, "spreadsheetId": {"S": "$(SPREADSHEET_ID)"}, "stripeKey": {"S":"$(STRIPE_PUBLIC_KEY)"}, "stripeSecretKey": {"S":"$(STRIPE_SECRET_KEY)"}}'
	curl https://api.stripe.com/v1/webhook_endpoints \
  	-u $(STRIPE_SECRET_KEY): \
  	-d limit=1 -G \
		| jq ".data[0]" --exit-status || curl https://api.stripe.com/v1/webhook_endpoints \
			-u $(STRIPE_SECRET_KEY): \
			-d url="https://$(STAGE).storefront.nz/shop/$(ID)/order/webhook" \
			-d "enabled_events[]"="checkout.session.completed"

set-google-api-key:
	test -n "$(STAGE)"
	test -n "$(GOOGLE_API_KEY)"
	aws ssm put-parameter --name /api/$(STAGE)/google-api-key --type SecureString --value $(GOOGLE_API_KEY)

deploy:
	npm run build
	serverless deploy