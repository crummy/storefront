#!/usr/bin/env bash

echo "Starting DynamoDB..."

# Only run the container if it is not exist (just to save some time at local)
if ! docker ps --format '{{.Names}}' | egrep '^simple-sell-dynamodb$' &> /dev/null; then
  docker container stop simple-sell-dynamodb
  docker container rm simple-sell-dynamodb
  docker run --rm --name simple-sell-dynamodb -p 8000:8000 -d cnadiminti/dynamodb-local
fi

# Wait for DynamoDB to be ready
while ! echo exit | nc localhost 8000;
do
  sleep 1;
done
