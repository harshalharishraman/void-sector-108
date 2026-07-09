const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const sdx=require('./socket/s-index.js')
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 4000;
const publicPath = path.join(__dirname, "../frontend");

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.static(publicPath));

sdx.s_init(io);

httpServer.listen(port, () => {
  console.log(`server started and listening at port: ${port}`);
});
