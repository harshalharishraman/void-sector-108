const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const router=require('./view/router')
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 4000;
const publicPath = path.join(__dirname, "..", "public");

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.static(publicPath));

io.on("connection", (socket) => {
  console.log(`socket connected: ${socket.id}`);
  
  socket.on("join-room",(r_id,uname)=>{
    router.join_room(io,socket,r_id,uname)
  })

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`server started and listening at port: ${port}`);
});
