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

import {Loader} from 'lucide-react'
import { Message } from "@aws-sdk/client-sqs";
import { SideNavBar } from "@/components/side-nav-bar";
import { Card, CardContent } from "@/components/ui/card";

import Editor, { useMonaco } from "@monaco-editor/react";

import { loader } from "@monaco-editor/react";

import ayumirage from '@/assets/AyuMirage.json'

type QueueType = {
  url: string;
  name: string;
};

function App() {
  const [queues, setQueues] = useState<QueueType[] | undefined>([]);
  const [selectedQueue, setSelectedQueue] = useState<QueueType | null>(null);
  const [messageToBeSent, setMessageToBeSent] = useState<string>("");
  const [pollingForMessages, setPollingForMessages] = useState<boolean>(false);

  const [messagesList, setMessagesList] = useState<Message[] | undefined>([]);


  useEffect(() => {
    const fetchQueues = async () => {
      const response = await listQueues();
      setQueues(
        response.QueueUrls?.map((queueUrl) => {
          return {
            url: queueUrl,
            name: queueUrl.split("/").pop() ?? "",
          };
        })
      );
    };
    fetchQueues();
  }, []);

  const selectQueue = (queue: QueueType) => {
    setSelectedQueue(queue);
  };

  const sendMessage = async () => {
    if (selectedQueue) {
      const response = await sendSqsMessage(messageToBeSent, selectedQueue.url);
      console.log(response);
    }
  };

  const pollForMessages = async () => {
    if (selectedQueue) {
      setPollingForMessages(true);
      const interval = setInterval(async () => {
        const response = await receiveSQSMessage(selectedQueue.url);
        setMessagesList([
          ...(messagesList ?? []),
          ...(response.Messages ?? []),
        ]);
      }, 5000);
      setTimeout(() => {
        clearInterval(interval);
        setPollingForMessages(false);
      }, 30000);
    }
  };

  useEffect(() => {
    loader.init().then((monaco) =>
      import("monaco-themes/themes/Monokai.json").then((data) => {
        monaco.editor.defineTheme("github-dark", data);
      })
      // monaco.editor.defineTheme("github-dark", ayumirage)
    );
  }, []);

  return (
    <div className="flex h-screen antialiased">
      <SideNavBar />
      <div className="flex-col w-3/12 border-r-1 border-stone-600 font-mono text-xs overflow-y-scroll">
        {queues?.map((queue) => {
          return (
            <div
              className={cn(
                "border-b-1 border-stone-600 p-6 hover:cursor-pointer",
                queue === selectedQueue ? "bg-primary" : ""
              )}
              key={queue.url}
              onClick={() => selectQueue(queue)}
            >
              <span className="">{queue.name}</span>
            </div>
          );
        })}
      </div>
      {selectedQueue && (
        <div className="flex flex-col w-8/12 space-y-4 p-4 h-screen overflow-y-scroll">
          <span className="text-3xl font-bold font-display">
            {selectedQueue.name}
          </span>
          <div className="flex flex-row-reverse w-full space-x-reverse space-x-2">
            <Button variant="outline">Purge</Button>
            <Button variant="destructive">Delete</Button>
          </div>
          <Card className="bg-stone-800">
            <CardContent className="p-4 flex flex-col space-y-4 justify-center">
              <div className="flex flex-col space-y-2 text-sm">
                <span className="font-semibold">Name</span>
                <span className="text-stone-300">{selectedQueue.name}</span>
              </div>
              <div className="flex flex-col space-y-2 text-sm">
                <span className="font-semibold">URL</span>
                <span className="text-stone-300">{selectedQueue.url}</span>
              </div>
            </CardContent>
          </Card>
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
            {/* <Textarea
              placeholder="Message body"
              id="message-body"
              className="font-mono"
              rows={10}
              value={messageToBeSent}
              onChange={(e) => setMessageToBeSent(e.target.value)}
            /> */}
            <Editor
              height="50vh"
              defaultLanguage="json"
              options={{
                minimap: {
                  enabled: false,
                },
                lineNumbers: "off",
                fontFamily: "JetBrains Mono",
              }}
              theme="github-dark"
              defaultValue='{"hello": "world"}'
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
                <Loader className="h-4 w-4 animate-spin"/>
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
                      <Button
                        onClick={() => console.log("lll")}
                        variant={"link"}
                      >
                        {message.MessageId}
                      </Button>
                    </TableCell>
                    <TableCell className="max-w-1/3">
                      {message.ReceiptHandle}
                    </TableCell>
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
