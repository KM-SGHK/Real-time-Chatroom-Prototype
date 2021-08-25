//1. Basic Config
import express from "express";
//import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import expressSession from "express-session";

dotenv.config();
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {},
});

const sessionMiddleware = expressSession({
  secret: "testing socket",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

app.use(sessionMiddleware);

app.use(cors());

// 監硬幫socket.io 加返個session
// 好似socket.io 嘅middleware 咁
io.use((socket: any, next: any) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});

const url: any = process.env.mongoURI;
const database = process.env.DB;

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db: any;

setTimeout(async function () {
  await client.connect();
  console.log("Mongodb connected.");
  db = client.db(database);
}, 0);

export function getDb() {
  return db;
}

app.get("/", (req, res) => {
  console.log("api connected");
  res.json({ msg: "This is dummy get" });
});

// 1. Basic Config
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Listening to ${PORT} port.`);
});

io.on("connection", (socket: any) => {
  // emit needs a event key and a value
  socket.on("join", (data: any) => {
    // console.log('testing socket, ', socket)
    console.log("the user entering the room is ", data);
    if (roomChecker(data)) {
      socket.join(data.roomId.toString());
      console.log("Smart");
      socket.emit("joinedUsers", data);
    } else {
      console.log("Oh No");
    }
  });

  socket.on("privateMessage", (data: any) => {
    // console.log('testing socket, ', socket)
    console.log("msg info testing ", data);
    if (roomChecker(data)) {
      let msg = {
        content: data.message,
        sender: data.sender,
        receiver: data.receiver,
      };
      io.in(data.roomId.toString()).emit("getMsg", msg);
    } else {
      console.log("You can't send message");
    }
  });

  // console.log("testing broadcast", data.roomId);
  socket.on("create-room", (name: any) => {
    console.log("Then room name received is ", name);
  });
  socket.emit("greeting", "Hello"); 
});
// server.listen(8000);

function roomChecker(data: any) {
  console.log('testing data room id: ', data.roomId, data.userId)
  let room = {
    id: 198,
    user: [888, 999],
  };
  console.log("testing roomID, ", data.roomId);
  console.log("testing userID, ", data.userId);
  if (data.roomId == room.id && room.user.includes(data.userId)) {
    return true;
  } else {
    return false;
  }
}
