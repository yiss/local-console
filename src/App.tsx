import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  getQueueAttributes,
  listQueues,
  receiveSQSMessage,
  sendSqsMessage,
} from "./api/sqs";
import { useState, useEffect, useMemo } from "react";
import { Label } from "./components/ui/label";
import { cn } from "./lib/utils";
import { ReloadIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Message } from "@aws-sdk/client-sqs";

function App() {
  const [queues, setQueues] = useState<string[] | undefined>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [messageToBeSent, setMessageToBeSent] = useState<string>("");
  const [pollingForMessages, setPollingForMessages] = useState<boolean>(false);

  const [messagesList, setMessagesList] = useState<Message[] | undefined>([]);

  useEffect(() => {
    const fetchQueues = async () => {
      const response = await listQueues();
      setQueues(response.QueueUrls);
    };
    fetchQueues();
  }, []);

  const selectedQueueName = useMemo(() => {
    if (selectedQueue) {
      const queueName = selectedQueue.split("/").pop();

      return queueName;
    }
  }, [selectedQueue]);

  const selectQueue = (queueUrl: string) => {
    setSelectedQueue(queueUrl);
  };

  const sendMessage = async () => {
    if (selectedQueue) {
      const response = await sendSqsMessage(messageToBeSent, selectedQueue);
      console.log(response);
    }
  };

  const pollForMessages = async () => {
    if (selectedQueue) {
      setPollingForMessages(true);
      const interval = setInterval(async () => {
        const response = await receiveSQSMessage(selectedQueue);
        setMessagesList([
          ...(messagesList ?? []),
          ...(response.Messages ?? []),
        ]);
      }, 5000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setPollingForMessages(false);
      }, 30000);
    }
  };

  return (
    <div className="flex h-screen antialiased">
      <div className="flex flex-col p-4 border-r border-r-1 border-stone-600">
        <button>
          <svg
            // className="w-6 h-6"
            height="40"
            width="40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
                id="Arch_AWS-Simple-Queue-Service_32_svg__a"
              >
                <stop stopColor="#B0084D" offset="0%"></stop>
                <stop stopColor="#FF4F8B" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
              <path
                d="M0 0h40v40H0z"
                fill="url(#Arch_AWS-Simple-Queue-Service_32_svg__a)"
              ></path>
              <path
                d="M14.342 22.35l1.505-1.444a.501.501 0 00.013-.708l-1.505-1.555-.72.695.676.7h-2.32v.999h2.274l-.617.592.694.72zm12.016.003l1.55-1.453a.5.5 0 00.011-.717l-1.55-1.546-.708.707.694.694H24.01v.999H26.3l-.627.588.686.728zm-8.77 1.008a6.458 6.458 0 012.417-.467c.842 0 1.665.163 2.416.467-.669-1.771-.669-3.971 0-5.742-1.502.607-3.331.607-4.833 0 .669 1.77.669 3.97 0 5.742zm-1.944 1.98a.494.494 0 010-.707c1.94-1.936 1.94-6.352 0-8.289a.494.494 0 010-.706.502.502 0 01.709 0c.921.92 2.252 1.447 3.652 1.447 1.4 0 2.731-.528 3.653-1.447a.502.502 0 01.854.354c0 .128-.05.255-.146.352-1.942 1.937-1.942 6.353 0 8.29a.501.501 0 01-.708.706c-.922-.92-2.253-1.447-3.653-1.447s-2.731.527-3.652 1.447a.502.502 0 01-.709 0zm16.898-5.905a1.562 1.562 0 00-1.106-.456 1.558 1.558 0 00-1.105 2.662c.61.608 1.601.608 2.211 0a1.56 1.56 0 000-2.206zm.708 2.913a2.56 2.56 0 01-1.814.749 2.56 2.56 0 01-1.813-4.369c1-.997 2.628-.997 3.627 0 1 .999 1 2.622 0 3.62zM9.67 19.447a1.562 1.562 0 00-1.106-.456 1.56 1.56 0 00-1.105 2.662 1.56 1.56 0 102.21-2.206zm.708 2.912a2.56 2.56 0 01-1.814.749A2.559 2.559 0 016.75 18.74c1-.997 2.627-.997 3.627 0 1 .999 1 2.622 0 3.62zm17.057 6.551A10.514 10.514 0 0119.957 32a10.51 10.51 0 01-7.475-3.09c-1.316-1.312-2.074-2.44-2.537-3.774l-.947.327c.51 1.466 1.365 2.747 2.776 4.154A11.506 11.506 0 0019.957 33c3.093 0 6-1.201 8.185-3.383 1.14-1.139 2.279-2.43 2.87-4.156l-.948-.323c-.525 1.532-1.575 2.719-2.63 3.772zM9.945 15.86l-.947-.328c.512-1.467 1.368-2.749 2.778-4.156 4.51-4.5 11.85-4.502 16.362 0 1.08 1.077 2.266 2.414 2.874 4.156l-.948.328c-.54-1.55-1.635-2.78-2.634-3.777a10.508 10.508 0 00-7.473-3.087 10.508 10.508 0 00-7.472 3.087c-1.298 1.295-2.081 2.46-2.54 3.777z"
                fill="#FFF"
              ></path>
            </g>
          </svg>
        </button>
      </div>
      <div className="flex-col flex-3 border-r-1 border-stone-600 font-mono text-xs overflow-y-scroll">
        {queues?.map((queue) => {
          return (
            <div
              className={cn(
                "border-b-1 border-stone-600 p-6 hover:cursor-pointer",
                queue === selectedQueue ? "bg-primary" : ""
              )}
              key={queue}
              onClick={() => selectQueue(queue)}
            >
              <span className="">{queue}</span>
            </div>
          );
        })}
      </div>
      {selectedQueue && (
        <div className="flex flex-col space-y-4 p-4 w-full max-w-3/4">
          <span className="text-4xl font-bold font-display">
            {selectedQueueName}
          </span>
          <div className="flex justify-between w-full items-center">
            <span className="text-xl font-semibold font-display">
              Send message
            </span>
            <Button color="primary" onClick={sendMessage}>
              Send
            </Button>
          </div>
          <div className="grid w-full gap-4">
            <Label htmlFor="message">Message body</Label>
            <Textarea
              placeholder="Message body"
              id="message-body"
              className="font-mono"
              value={messageToBeSent}
              onChange={(e) => setMessageToBeSent(e.target.value)}
            />
          </div>
          <div className="flex justify-between w-full items-center">
            <span className="text-xl font-semibold font-display">
              Receive messages
            </span>
            <Button
              color="primary"
              onClick={pollForMessages}
              disabled={pollingForMessages}
            >
              {pollingForMessages ? (
                <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Poll for messages"
              )}
            </Button>
          </div>
          <Table>
            <TableCaption>A list of received messages</TableCaption>
            <TableHeader className="font-display font-semibold">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="w-[100px]">Sent</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Receive count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messagesList?.map((message) => {
                return (
                  <TableRow key={message.MessageId}>
                    <TableCell className="font-medium">
                      <Button onClick={() => console.log('lll')} variant={"link"}>{message.MessageId}</Button>
                    </TableCell>
                    <TableCell className="max-w-1/3">{message.ReceiptHandle}</TableCell>
                    <TableCell>{message.MD5OfBody}</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-display font-semibold">
                Lambda triggers
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableCaption>List of lambda triggers for SQS</TableCaption>
                  <TableHeader className="font-display font-semibold">
                    <TableRow>
                      <TableHead className="w-[100px]">UUID</TableHead>
                      <TableHead>ARN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}

export default App;
