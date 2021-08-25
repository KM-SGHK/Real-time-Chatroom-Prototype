import React, { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

function App() {
  var [input, setInput] = useState("");
  var [name, setName] = useState("Input Name");
  var [message, setMessage] = useState("Input Message");
  var [roomNumber, setRoomNumber] = useState("198");
  var [displayedText, setDisplayedText] = useState<any[]>([]);
  const socket = io("http://localhost:8000");
  const useStyles = makeStyles((theme) => ({
    root: {
      "& > *": {
        margin: theme.spacing(1),
        width: "25ch",
      },
    },
    margin: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  }));
  const classes = useStyles();
  const sendMessage = () => {
    console.log("testing msg submission?");
    let msg = {
      roomId: 198,
      //"Tom" ? 200 : 198, //for changing user's room number
      userId: name == "Peter" ? 888 : 999,
      sender: name,
      receiver: name == "Peter" ? "Tom" : "Peter",
      message: message,
    };
    socket.emit("privateMessage", msg);
    setMessage("");
  };
  useEffect(() => {
    // on event key
    let Info_peter = {
      roomId: 198,
      userId: 888,
    };
    // let userInfo = {
    //   "userID": 999
    // }

    let Info_tom = {
      roomId: 198,
      userId: 999,
    };

    let randomNum = Math.floor(Math.random() * 3) % 2;

    if (randomNum == 0) {
      let Info = Info_peter;
      console.log("testing, ", randomNum);
      Info.userId == 888 ? setName("Peter") : setName("Tom");
      socket.emit("join", Info);
    } else {
      let Info = Info_tom;
      console.log("testing, ", randomNum);
      Info.userId == 999 ? setName("Tom") : setName("Peter");
      socket.emit("join", Info);
    }

    socket.on("getMsg", function (data) {
      console.log("testing room msg, ", data);
      setDisplayedText((displayedText) => [
        ...displayedText,
        {
          sender: data.sender,
          message: data.content,
        },
      ]);
      console.log("testing array length", displayedText.length);
    });

    socket.on("SayHellotoRMUser", function (data) {
      console.log("testing room msg, ", data);
    });
    socket.on("joinedUsers", function (data) {
      console.log("testing user got from server, ", data);
    });
    socket.on("greeting", function (data) {
      console.log("testing data, ", data);
      setInput(data);
    });
  }, []);
  return (
    <div>
      <div className="input-box2">
        <h2>Real-time Chatroom Prototype</h2>
      </div>
      <div className="input-box">
        <h4 className="text-formatter">Message: {message}</h4>
      </div>
      <div>
        <CssBaseline />
        <Container maxWidth="sm">
          <Typography
            component="div"
            style={{ backgroundColor: "#cfe8fc", height: "60vh" }}
          >
            <h3>Hello {name}</h3>
            <div>
              {displayedText.map((message: any) => (
                <p>
                  {message.sender}: {message.message}
                </p>
              ))}
            </div>
          </Typography>
        </Container>
      </div>
      <div className="input-box">
        <form className={classes.root} noValidate autoComplete="off">
          {/* <TextField
            id="outlined-basic"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          /> */}
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: 320 }}
          />
        </form>
        <Button
          variant="contained"
          size="large"
          color="primary"
          className={classes.margin}
          onClick={sendMessage}
          style={{ width: 220 }}
        >
          SEND
        </Button>
      </div>
    </div>
  );
}

export default App;
