// External Libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const docusign = require('docusign-esign');
const path = require('path');

// Internal Libraries
const shared = require('./shared/shared');
const get_handers = require('./handlers/get_handlers');
const post_handlers = require('./handlers/post_handlers');

// Start Express Service
// Make sure localtunnel is running on port 3001
// lt --subdomain chatkit-docusign --port 3001
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Routes
// GETs
app.get('/sign/:userID', (req, res) => {get_handers.getUserNDA(req, res)});
app.get(`/get_document/:username`, (req, res) => {get_handers.getDocumentByUsername(req,res)});
app.get(`/get_user/:username`, (req, res) => {get_handers.getUserByUsername(req, res)});
app.get(`/admin_info/:username`, (req, res) => {get_handers.getAdminUserInfo(req, res)});

// POSTs
app.post('/webhook', bodyParser.text({limit: '50mb', type: '*/xml'}),
    (req, res) => {post_handlers.postWebhook(req, res)});
app.post('/authenticate', (req, res) => {post_handlers.postAuthenticate(req, res)});
app.post('/message/:roomID/:userID', (req, res) => {post_handlers.postUserMessageInRoom(req, res)});


// Instantiate Docusign APIClient
const apiClient = new docusign.ApiClient();
apiClient.setBasePath(shared.BASE_URL);
docusign.Configuration.default.setDefaultApiClient(apiClient);

shared.API_CLIENT = apiClient;

// Get an access token and store it
shared.API_CLIENT.configureJWTAuthorizationFlow(path.resolve(__dirname, shared.PRIVATE_KEY_FILE), shared.OAUTH_BASE_URL, shared.INTEGRATOR_KEY, shared.USER_ID, shared.TOKEN_EXPIRATION_SECONDS, (err, res) => {
    if (!err && res.body && res.body.access_token) {
        apiClient.getUserInfo(res.body.access_token, function (err, userInfo) {
            shared.ACCESS_TOKEN = res.body.access_token;

            const baseUri = userInfo.accounts[0].baseUri;
            const accountDomain = baseUri.split('/v2');
            // below code required for production, no effect in demo (same domain)
            shared.API_CLIENT.setBasePath(accountDomain[0] + "/restapi");
            console.log('LoginInformation: ' + JSON.stringify(userInfo.accounts));

            shared.LOGIN_ACCOUNT = userInfo.accounts[0];

            const PORT = 3001;
            app.listen(PORT, err => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Running on port ${PORT}`);
                }
            });
        });
    }
});