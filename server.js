const cors = require("cors");
const express = require("express");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(3000, {
  path: '/socket.io',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    origins: ['http://localhost:8081']
  }
});

const computationcontroller = require("./src/controller/computation.controller.js")


global.__basedir = __dirname;

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

const initRoutes = require("./src/routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('startcomputation', (data) => {
    computationcontroller.startComputation(socket, data)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


let port = 8080;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});

