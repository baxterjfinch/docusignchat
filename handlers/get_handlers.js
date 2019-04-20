const users = require('../models/users');
const shared = require('../shared/shared');
const docusign = require('docusign-esign');

module.exports = {
    getUserNDA(req, res) {
        const {userID} = req.params;
        const user = users.users.find(u => u.id === userID);

        if(user) {
            // Webhook notifications from DocuSign
            const envelopeEvents = [];
            let envelopeEvent = new docusign.EnvelopeEvent();
            envelopeEvent.envelopeEventStatusCode = 'Sent';
            envelopeEvents.push(envelopeEvent);
            envelopeEvent = new docusign.EnvelopeEvent();
            envelopeEvent.envelopeEventStatusCode = 'Completed';
            envelopeEvents.push(envelopeEvent);

            const recipientEvents = [];
            let recipientEvent = new docusign.RecipientEvent();
            recipientEvent.recipientEventStatusCode = 'Sent';
            recipientEvents.push(recipientEvent);
            recipientEvent = new docusign.RecipientEvent();
            recipientEvent.recipientEventStatusCode = 'Completed';
            recipientEvents.push(recipientEvent);

            const eventNotification = new docusign.EventNotification();
            eventNotification.url = shared.WEBHOOK_URL;
            eventNotification.loggingEnabled = true;
            eventNotification.envelopeEvents = envelopeEvents;
            eventNotification.recipientEvents = recipientEvents;

            // create a new envelope object that we will manage the signature request through
            const envDef = new docusign.EnvelopeDefinition();
            envDef.emailSubject = 'Please sign this document to start using the chat';
            envDef.templateId = shared.TEMPLATE_ID;
            envDef.eventNotification = eventNotification;

            // create a template role with a valid templateId and roleName and assign signer info
            const templateRole = new docusign.TemplateRole();
            templateRole.roleName = shared.TEMPLATE_ROLE;
            templateRole.name = user.name;
            templateRole.email = user.email;

            // assign template role(s) to the envelope
            envDef.templateRoles = [templateRole];

            // send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
            envDef.status = 'sent';

            // use the |accountId| we retrieved through the Login API to create the Envelope
            const accountId = shared.LOGIN_ACCOUNT.accountId;

            // instantiate a new EnvelopesApi object
            const envelopesApi = new docusign.EnvelopesApi();

            // call the createEnvelope() API
            envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, (err, envelopeSummary, response) => {
                if (err) {
                    console.log(err);
                    res.status(401).send({ error_description: err });
                }
                let unjson_envelope = envelopeSummary;
                user.envelope_id = unjson_envelope.envelopeId;
                res.status(200).send({});
            });
        } else {
            res.status(401).send({ error_description: "The user doesn't exist" });
        }
    },

    getDocumentByUsername(req, res) {
        const {username} = req.params;
        const user = users.users.find(u => u.id === username);

        if (user) {
            getDocuments(user).then((documents) => {
                console.log("GOT FROM ASYNC", documents)
            }).catch((err) => {
                console.log(err)
            })
        } else {
            res.status(401).send({user: false})
        }
    },

    getUserByUsername(req, res) {
        const {username} = req.params;
        const user = users.users.find(u => u.id === username);

        if (user) {
            res.status(200).send({user: user})
        } else {
            res.status(401).send({user: false})
        }
    },

    getUserHasSigned(req, res) {
        const {userID} = req.params;
        const user = users.users.find(u => u.id === userID);

        if (user) {
            if (user.hasSigned) {
                res.status(200).send({ description: "signed" });
            } else {
                res.status(401).send({ error_description: "unsigned" });
            }
        }
    }
};

const getDocuments = async (user) => {
    // Gets a list of all Envelopes Docs
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(shared.BASE_URL);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + shared.ACCESS_TOKEN);

    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
    let results = await envelopesApi.listDocuments(shared.ACCOUNT_ID, user.envelope_id, null);

    return results;
};