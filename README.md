# gmail-push-webhook-handler

A quick and dirty lambda to invoke a flow from a webhook until we build the functionality internal to the platform.

curl -X PUT -H "Authorization: Bearer xxxxx" -H "Content-Type: application/json" https://integration-core-dev-api.liberateinc.io -d '{"slug": "gmail-inbox-item-to-slack-4d20f121-399c-4245-a029-231febf4e397", "context": {}}'
