import React, { Component } from 'react'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import TypingIndicator from './components/TypingIndicator'
import WhosOnlineList from './components/WhosOnlineList'

const SERVER_URL = 'http://localhost:3001';
const CHATKIT_ROOM_ID = "19391925";

class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentChatUser: props.currentUser,
      currentRoom: {},
      messages: [],
      usersWhoAreTyping: [],
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.sendTypingEvent = this.sendTypingEvent.bind(this);
    this.sendDocusignRequest = this.sendDocusignRequest.bind(this);
  }

  sendDocusignRequest() {
    fetch(`${SERVER_URL}/sign/${this.state.currentChatUser.id}`,
        {
          method: "GET",
        })
        .then(res => res.json())
        .then(res => {
          if(res.error_description) {
            alert(res.error_description);
          } else {
            alert("The NDA has been sent to your email");
          }
        })
        .catch(err => alert(err));
  }

  sendTypingEvent() {
    this.state.currentChatUser
      .isTypingIn({ roomId: this.state.currentRoom.id })
      .catch(error => console.error('error', error))
  }

  sendMessage(text) {
    fetch(`${SERVER_URL}/message/${this.state.currentRoom.id}/${this.state.currentChatUser.id}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({text: text})
    })
    .then((res) => {
      console.log(res);
    });
  }

  componentDidMount() {
    this.state.currentChatUser.subscribeToRoom({
      roomId: CHATKIT_ROOM_ID,
      messageLimit: 100,
      hooks: {
        onMessage: message => {
          this.setState({
            messages: [...this.state.messages, message],
          })
        },
        onUserStartedTyping: user => {
          this.setState({
            usersWhoAreTyping: [...this.state.usersWhoAreTyping, user.name],
          })
        },
        onUserStoppedTyping: user => {
          this.setState({
            usersWhoAreTyping: this.state.usersWhoAreTyping.filter(
              username => username !== user.name
            ),
          })
        },
        onPresenceChanged: () => this.forceUpdate(),
        onUserJoined: () => this.forceUpdate(),
      },
    })
    .then(currentRoom => {
      this.setState({ currentRoom });
        this.renderListeners();
    })
    .catch(error => console.error('error', error))
  }

    renderListeners() {
      document.getElementById('get_signed_nda').addEventListener('click', () => {
          fetch(`${SERVER_URL}/get_document/${this.state.currentChatUser.id}`, {
              method: "GET",
              headers:{
                  'Content-Type': 'application/json'
              }
          }).then((res) => {
              console.log(res);
          })
      })
    }

  render() {
    const styles = {
      container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      chatContainer: {
        display: 'flex',
        flex: 1,
      },
      whosOnlineListContainer: {
        width: '15%',
        padding: 20,
        backgroundColor: 'rgba(3, 31, 44, 0.91)',
        color: 'white',
      },
      chatListContainer: {
        padding: 20,
        width: '85%',
        display: 'flex',
        flexDirection: 'column',
      },
    }
      return (
          <div style={styles.container}>
              <div style={styles.chatContainer}>
                  <aside style={styles.whosOnlineListContainer}>
                      <WhosOnlineList
                          currentChatUser={this.state.currentChatUser}
                          users={this.state.currentRoom.users}
                      />
                      <button id="get_signed_nda">Get Signed NDA</button>
                  </aside>
                  <section style={styles.chatListContainer}>
                      <MessageList
                          messages={this.state.messages}
                          style={styles.chatList}
                      />
                      <TypingIndicator usersWhoAreTyping={this.state.usersWhoAreTyping} />
                      <SendMessageForm
                          onSubmit={this.sendMessage}
                          onChange={this.sendTypingEvent}
                          onClick={this.sendDocusignRequest}
                      />
                  </section>
              </div>
          </div>
      )

  }
}

export default ChatScreen
