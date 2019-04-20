const users = require('../models/users');
const shared = require('../shared/shared');
const xmlParser = require('xml2js');
const request = require('request');
const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: shared.CHATKIT_INSTANCE_LOCATOR,
    key: shared.CHATKIT_SECRET_KEY
});

module.exports = {
    postWebhook(req, res) {
        xmlParser.parseString(req.body, (err, xml) => {
            if (err || !xml) {
                throw new Error("Cannot parse Connect XML results: " + err);
            }
            const envelopeStatus = xml.DocuSignEnvelopeInformation.EnvelopeStatus;

            if (envelopeStatus[0].Status[0] === 'Completed') {
                const email = envelopeStatus[0].RecipientStatuses[0].RecipientStatus[0].Email[0];
                console.log('Completed email: ' + email);
                const user = users.users.find(u => u.email === email);
                if(user) {
                    user.hasSigned = true;
                    console.log("DOCUSIGN ENVELOPE", xml)
                }
            }
        });
        res.send('Received!');
    },

    postAuthenticate(req, res) {
        const user = users.users.find(u => u.id === req.query.user_id);

        if(user) {
            const authData = chatkit.authenticate({ userId: req.query.user_id });
            if(authData.status === 200) {
                user.token = authData.body.access_token;
            }
            res.status(authData.status).send(authData.body);
        } else {
            res.status(401).send("The user doesn't exist");
        }
    },

    postUserMessageInRoom(req, res) {
        const {roomID, userID} = req.params;
        const user = users.users.find(u => u.id === userID);

        if(user) {
            if(user.hasSigned) {
                request.post({
                    url: `${shared.CHATKIT_API_URL}/rooms/${roomID}/messages`,
                    json: {text: req.body.text},
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                }, (err, httpResponse, body) => {
                    res.status(httpResponse.statusCode).send(body);
                });
            } else {
                res.status(401).send({ error_description: "You haven't signed the NDA" });
            }
        } else {
            res.status(401).send({ error_description: "The user doesn't exist" });
        }
    }
}