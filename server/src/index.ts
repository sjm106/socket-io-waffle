import * as http from "http";
import * as express from "express";
import * as socketIo from "socket.io";
import * as cors from "cors";

import { nouns } from "./nouns";
import { adjectives } from "./adjectives";

const server = express();
server.use(cors());
server.use(express.json());
const httpServer = http.createServer(server);
const io = socketIo(httpServer, { origins: "*:*" });

const chatHistory = [];
const userDetails = {};

const onUserConnect = (client: socketIo.Socket) => {
  userDetails[client.id] = {
    userId: generateUserName(),
    connectedAt: new Date()
  };
  console.log("Connected with client id:", userDetails[client.id].userId);
  io.emit("broadcastUserConnection", userDetails[client.id]);
  assignUserName(client);
  return onUserDisconnect(client.id);
};

const onUserDisconnect = (clientId: string) => () => {
  const connectedAt = userDetails[clientId].connectedAt as Date;
  const time = (Date.now().valueOf() - connectedAt.valueOf()) / 1000;
  const message = {
    userId: "SYSTEM",
    message: `${userDetails[clientId].userId} disconnected after ${time}`
  };
  console.log(message);
  io.emit("broadcastUserDisconnection", message);
};

const onChatSubmission = client => (chat: string) => {
  if (chat === "") return;
  chatHistory.push({
    userId: userDetails[client.id].userId,
    message: chat
  });
  io.emit("handleChatHistory", chatHistory);
};

const generateUserName = () => {
  const randomAdjective =
    adjectives[Math.round(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.round(Math.random() * nouns.length)];
  return `${randomAdjective}-${randomNoun}`;
};

const assignUserName = (client: socketIo.Socket) => {
  client.emit("sendUserDetails", userDetails[client.id]);
};

io.on("connection", client => {
  const onDisconnect = onUserConnect(client);
  client.emit("handleChatHistory", chatHistory);
  client.on("disconnect", onDisconnect);
  client.on("submitChat", onChatSubmission(client));
});

io.listen(3001);
console.log("Listening on port 3001");
