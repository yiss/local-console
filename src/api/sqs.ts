import {
  SQSClient,
  ListQueuesCommand,
  GetQueueAttributesCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";

const credentials = {
  accessKeyId: "test",
  secretAccessKey: "test",
};

const client = new SQSClient({
  region: "eu-west-1",
  endpoint: "http://localhost:4566",
  credentials,
});

export async function listQueues() {
  const command = new ListQueuesCommand({
    QueueNamePrefix: "",
  });
  return client.send(command);
}

export async function getQueueAttributes(queueUrl: string) {
  const command = new GetQueueAttributesCommand({
    AttributeNames: ["All"],
    QueueUrl: queueUrl,
  });
  return client.send(command);
}


export async function sendSqsMessage(messageBody: string, queueUrl: string) {
  const command = new SendMessageCommand({
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  });
  return client.send(command);
}

export async function receiveSQSMessage(queueUrl: string) {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    WaitTimeSeconds: 30,
  });
  return client.send(command);
}