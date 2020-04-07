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
	aws cloudformation deploy --template-file cloudformation.yml --stack-name simpleseller

local:
	docker-compose -d up
