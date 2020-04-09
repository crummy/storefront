STACK_NAME := "simple-sell-ui"
BUCKET = $(shell aws cloudformation --region ap-southeast-2 describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
CLOUDFRONT_ID = $(shell aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)

dynamodb-local:
	docker run -p 8000:8000 --rm -it amazon/dynamodb-local

create-dynamodb-tables:
	aws dynamodb create-table \
		--table-name "shopConfigs" \
		--attribute-definitions AttributeName=id,AttributeType=S \
		--key-schema AttributeName=id,KeyType=HASH \
		--endpoint-url http://localhost:8000 \
		--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# TODO: Get the ARN out of here
deploy-cloudformation:
	aws cloudformation deploy --template-file cloudformation/route53-zone.yml --stack-name $(STACK_NAME) --parameter-overrides DomainName="storefront.nz" && \
	aws cloudformation deploy --template-file cloudformation/s3-website.yml --stack-name $(STACK_NAME) --parameter-overrides DomainName="storefront.nz" FullDomainName="www.storefront.nz" AcmCertificateArn="arn:aws:acm:us-east-1:113052017116:certificate/8b2ca21f-c580-4496-bbb7-de0673d33a74"

sync:
	cd ui && npm run build && cd - && \
	aws s3 sync ./ui/public s3://$(BUCKET)/ && \
	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"