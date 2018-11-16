import * as React from "react";
import { render as ReactDomRender } from "react-dom";
import * as openSocket from "socket.io-client";

class App extends React.Component<
  any,
  { history: string[]; currentTextInput: string }
> {
  private socket: SocketIOClient.Socket;
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      currentTextInput: ""
    };
  }

  handleChatReceipt = (newChat: string) => {
    const addedToHistory = [...this.state.history, newChat];
    this.setState({
      history: addedToHistory
    });
  };

  handleBulkChatReceipt = (newChat: string[]) => {
    const addedToHistory = [...this.state.history, ...newChat];
    this.setState({
      history: addedToHistory
    });
  };

  componentDidMount() {
    this.socket = openSocket("http://localhost:3001");
    this.socket.on("handleChat", this.handleChatReceipt);
    this.socket.on("handleChatHistory", this.handleBulkChatReceipt);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  chatSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.socket.emit("submitChat", this.state.currentTextInput);
    this.setState({
      currentTextInput: ""
    });
  };
  render() {
    return (
      <div>
        <p>I am the main component</p>
        <div>
          <ul>
            {this.state.history.map((s, i) => (
              <li key={`${i}`}>{s}</li>
            ))}
          </ul>
        </div>
        <form onSubmit={this.chatSend}>
          <input
            name="chat"
            type="text"
            placeholder="input text here"
            onChange={e => this.setState({ currentTextInput: e.target.value })}
            value={this.state.currentTextInput}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

ReactDomRender(<App />, document.getElementById("root"));
