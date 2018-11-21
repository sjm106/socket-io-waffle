import * as React from "react";
import { render as ReactDomRender } from "react-dom";
import * as openSocket from "socket.io-client";
import "./style.css";

class App extends React.Component<
  any,
  { history: string[]; currentTextInput: string; userName: string }
> {
  private socket: SocketIOClient.Socket;
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      history: [],
      currentTextInput: ""
    };
  }
  chatWindow: HTMLDivElement;

  addChatToHistory = (newChat: string) => {
    const addedToHistory = [...this.state.history, newChat];
    this.setState({
      history: addedToHistory
    });
  };

  initChatWithHistory = (newChat: string[]) => {
    const addedToHistory = [...newChat];
    this.setState({
      history: addedToHistory
    });
  };

  handleUserConnection = userDetails => {
    this.addChatToHistory(
      `User ${userDetails.userId} joined at ${userDetails.connectedAt}`
    );
  };

  handleUserDetails = userDetails => {
    this.setState({
      userName: userDetails.userId
    });
  };

  componentDidMount() {
    this.socket = openSocket("http://localhost:3001");
    this.socket.on("handleChat", this.addChatToHistory);
    this.socket.on("handleChatHistory", this.initChatWithHistory);
    this.socket.on("broadcastUserConnection", this.handleUserConnection);
    this.socket.on("broadcastUserDisconnection", this.addChatToHistory);
    this.socket.on("sendUserDetails", this.handleUserDetails);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  handlechatSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.chatSend();
    this.scrollChatWindowToBottom();
  };

  chatSend = () => {
    this.socket.emit("submitChat", this.state.currentTextInput);
    this.setState({
      currentTextInput: ""
    });
  };

  scrollChatWindowToBottom = () =>
    this.chatWindow.scrollTo(0, this.chatWindow.clientHeight + 10);

  render() {
    return (
      <div className="main">
        <p>You are logged in as {this.state.userName}</p>
        <div className="chat-window" ref={node => (this.chatWindow = node)}>
          <ul>
            {this.state.history.map((s, i) => (
              <li key={`${i}`}>{s}</li>
            ))}
          </ul>
        </div>
        <form
          className="chat-input-form"
          onSubmit={this.handlechatSend}
          autoComplete="off"
        >
          <input
            name="chat"
            type="text"
            placeholder="input text here"
            onChange={e => this.setState({ currentTextInput: e.target.value })}
            value={this.state.currentTextInput}
            autoComplete="off"
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

ReactDomRender(<App />, document.getElementById("root"));
