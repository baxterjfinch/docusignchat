import React, { Component } from 'react'

const SERVER_URL = 'http://localhost:3001';

class SignNDAPrompt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUser: props.currentUser,
        }

        this.sendDocusignRequest = this.sendDocusignRequest.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.text);
        this.setState({ text: '' })
    }

    onClick(e) {
    }

    sendDocusignRequest() {
        fetch(`${SERVER_URL}/sign/${this.state.currentUser.id}`,
            {
                method: "GET",
            })
            .then(res => res.json())
            .then(res => {
                if(res.error_description) {
                    alert(res.error_description);
                } else {
                    localStorage.setItem("sent_nda", "true")
                    window.location.reload();
                }
            })
            .catch(err => alert(err));
    }

    render() {
        const formStyle = {
            margin: 10,
        }

        return (
            <div className="login-container">
                <div className="explainer-widget animated fadeInRight">
                    <div className="welcome-header">You Havent Signed The NDA. Please Do So Now</div>
                    <button className="login-button" id="intro-continue" onClick={this.sendDocusignRequest}>Request NDA</button>
                </div>
            </div>
        )
    }
}

export default SignNDAPrompt
