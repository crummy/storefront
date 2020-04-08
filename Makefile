STACK_NAME := "simple-sell"
BUCKET = $(shell aws cloudformation --region ap-southeast-2 describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" --output text)

dynamodb-local:
	docker run -p 8000:8000 --rm -it amazon/dynamodb-local

create-dynamodb-tables:
	aws dynamodb create-table \
		--table-name "shopConfigs" \
		--attribute-definitions AttributeName=id,AttributeType=S \
		--key-schema AttributeName=id,KeyType=HASH \
		--endpoint-url http://localhost:8000 \
		--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

deploy-cloudformation:
	aws cloudformation deploy --template-file cloudformation/dynamodb.yml --stack-name $(STACK_NAME) && \
	aws cloudformation deploy --template-file cloudformation/s3.yml --stack-name $(STACK_NAME)

sync:
	echo $(BUCKET) && \
	aws s3 sync ./ui/public s3://$(BUCKET)/
