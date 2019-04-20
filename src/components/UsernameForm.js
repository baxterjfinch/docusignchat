import React, { Component } from 'react'

class UsernameForm extends Component {
  constructor(props) {
    super(props);
    let cur_panel = this.getPanel();

    this.state = {
      username: '',
      panel: cur_panel,
    };

    this.onSubmit = this.onSubmit.bind(this)
    this.onChangeUsername = this.onChangeUsername.bind(this)
    this.nextPanel = this.nextPanel.bind(this)
    this.getPanel = this.getPanel.bind(this);
  }

  getPanel() {
    if (localStorage.getItem("sent_nda")) {
      return 4
    } else {
      return 1
    }
  }

  onSubmit(e) {
    e.preventDefault()
    if (this.state.username !== '') {
      this.props.onSubmit(this.state.username)
    }
  }

  onChangeUsername(e) {
    this.setState({ username: e.target.value })
  }

  nextPanel() {
    setTimeout(() => {
      this.setState({
        panel: this.state.panel += 1,
      })
      console.log(this.state.panel)
    }, 500)
  }

  render() {
    if (this.state.panel === 1) {
      let this_id = this.state.panel + "_widget";

      return (
          <div className="intro-container">
            <div id={this_id} className="intro-widget animated fadeInRight">
              <div className="welcome-header">Welcome To DocuChat!</div>
              <div className="welcome-body">DocuChat is a chatroom protected by a legally binding NDA.
                In order to gain access to the chatroom, you must sign an NDA
                document that will be emailed to you from Docusign.</div>
              <button className="continue-button" id="intro-continue" onClick={this.nextPanel}>Click To Continue</button>
            </div>
          </div>
      )
    } else if (this.state.panel === 2) {
      let this_id = this.state.panel + "_widget";

      return (
          <div className="intro-container">
            <div id={this_id} className="explainer-widget animated fadeInRight">
              <div className="welcome-header">Here's How It Works!</div>
              <div className="explainer-body">
                <ol>
                  <li className="explainer-item">Log in (On the next page)</li>
                  <li className="explainer-item">If you haven't already signed the NDA, Select "Request NDA"</li>
                  <li className="explainer-item">A Time-sensative email (120 seconds) will be sent to you with the document you must sign</li>
                  <li className="explainer-item">Once signed, refresh the page and log back in</li>
                </ol>

              </div>
              <button className="continue-button" id="intro-continue" onClick={this.nextPanel}>Click To Continue</button>
            </div>
          </div>
      )
    } else if (this.state.panel === 3) {
      let this_id = this.state.panel + "_widget";

      return (
          <div className="login-container">
            <div id={this_id} className="explainer-widget animated fadeInRight">
              <div className="welcome-header">What is your username?</div>
              <p className="login-input-div">
                <input
                    type="text"
                    placeholder="Username"
                    className="login-input-container"
                    onChange={this.onChangeUsername}
                />
              </p>
              <button className="login-button" id="intro-continue" onClick={this.onSubmit}>Login</button>
            </div>
          </div>
      )
    } else if (this.state.panel === 4) {
      let this_id = this.state.panel + "_widget";

      return (
          <div className="login-container">
            <div id={this_id} className="explainer-widget animated fadeInRight">
              <form onSubmit={this.onSubmit}>
                <div className="welcome-header">NDA Has Been Sent!<br></br>
                  Log In After Signing</div>
                <p className="login-input-div">
                  <input
                      type="text"
                      className="login-input-container"
                      placeholder="Username"
                      onChange={this.onChangeUsername}
                  />
                </p>
                <button className="login-button" id="intro-continue" onClick={this.onSubmit}>Login</button>
              </form>
            </div>
          </div>
      )
    }
  }
}

export default UsernameForm
