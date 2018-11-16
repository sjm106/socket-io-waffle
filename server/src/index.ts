import * as http from "http";
import * as express from "express";
import * as socketIo from "socket.io";
import * as cors from "cors";
const server = express();
server.use(cors());
server.use(express.json());
const httpServer = http.createServer(server);
const io = socketIo(httpServer, { origins: "*:*" });

const chatHistory = [];

io.on("connection", client => {
  client.on("submitChat", chat => {
    chatHistory.push(chat);
    client.emit("handleChat", chat);
    console.log(chat);
  });
  client.emit("handleChatHistory", chatHistory);
});

io.listen(3001);
console.log("Listening on port 3001");
