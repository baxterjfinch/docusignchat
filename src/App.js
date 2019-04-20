import React, { Component } from 'react'
import UsernameForm from './components/UsernameForm'
import SignNDAPrompt from './components/SignNDAPrompt'
import ChatScreen from './ChatScreen'
import Chatkit from '@pusher/chatkit-client'
import User from './models/user';

const CHATKIT_INSTANCE_LOCATOR = 'v1:us1:9965d6fd-6825-48a6-91ab-ce975bda46ca';
const SERVER_URL = 'http://localhost:3001';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentUser: null,
        currentChatUser: null,
      currentScreen: 'login',
    };
    this.onUsernameSubmitted = this.onUsernameSubmitted.bind(this);
  }

  onUsernameSubmitted(username, password) {
      this.getUserByUsername(username);
  }

    buildChatRoom(currentUser) {
        const chatManager = new Chatkit.ChatManager({
            instanceLocator: CHATKIT_INSTANCE_LOCATOR,
            userId: currentUser.id,
            tokenProvider: new Chatkit.TokenProvider({
                url: `${SERVER_URL}/authenticate`
            }),
        });

        chatManager
            .connect()
            .then(user => {
                console.log(user);
                this.setState({
                    currentChatUser: user,
                    currentScreen: 'ChatScreen',
                    currentUser: currentUser,
                })
            })
            .catch(error => alert(error.info))
    }

    getHasSigned(username) {
        fetch(`${SERVER_URL}/has_signed/${this.state.currentUser.id}`, {
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            if (res.ok) {
                this.buildChatRoom(username)
            } else {
                this.setState({
                    currentScreen: 'NeedsToSign',
                })
            }
        })
    }

    getUserByUsername(username) {
        fetch(`${SERVER_URL}/get_user/${username}`, {
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(res => {
            if (res.user) {
                let currentUser = new User(res.user);
                console.log(currentUser);

                if (!currentUser.hasSigned) {
                    this.setState({
                        currentUser: currentUser,
                        currentScreen: 'hasNotSignedNDA',
                    })
                } else {
                    this.buildChatRoom(currentUser);
                }
            } else {
                console.log("USER DOES NOT EXIST")
            }
        });
    }

  render() {
    if (this.state.currentScreen === 'login') {
      return (
          <UsernameForm onSubmit={this.onUsernameSubmitted} />
      )
    }
    if (this.state.currentScreen === 'ChatScreen') {
      return (
          <ChatScreen currentUser={this.state.currentChatUser} />
      )
    }
    if (this.state.currentScreen === 'hasNotSignedNDA') {
        return (
            <SignNDAPrompt currentUser={this.state.currentUser} />
        )
    }
      // if (this.state.currentScreen === 'NeedsToSign') {
      //     return <NeedsToSign currentUser={this.state.currentUser} />
      // }
  }
}

export default App
