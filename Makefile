STACK_NAME := "simple-sell-ui"
BUCKET = $(shell aws cloudformation --region us-east-1 describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
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

# Has to be run against us-east-1 because that's where cloudfront lives
deploy-cloudformation:
	aws --region us-east-1 cloudformation deploy --template-file cloudformation/s3-website.yml --stack-name $(STACK_NAME) --parameter-overrides DomainName="storefront.nz"

sync:
	cd ui && npm run build && cd - && \
	aws --region us-east-1 s3 cp --recursive --acl "public-read" ./ui/public s3://$(BUCKET)/ && \
	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"