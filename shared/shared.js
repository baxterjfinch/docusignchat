const CHATKIT_INSTANCE_LOCATOR = '';
const CHATKIT_INSTANCE_ID =  CHATKIT_INSTANCE_LOCATOR.split(':')[2];

module.exports = {
    // Chatkit info
    CHATKIT_SECRET_KEY:  '',
    CHATKIT_INSTANCE_LOCATOR: CHATKIT_INSTANCE_LOCATOR,
    CHATKIT_INSTANCE_ID: CHATKIT_INSTANCE_ID,

    // Docusign Info
    INTEGRATOR_KEY: '',
    USER_ID:  '',
    TEMPLATE_ID: '',
    ACCOUNT_ID:'',

    TEMPLATE_ROLE: 'user',
    TOKEN_EXPIRATION_SECONDS: 3600,
    WEBHOOK_URL: 'https://chatkit-docusign.localtunnel.me/webhook',
    BASE_URL: 'https://demo.docusign.net/restapi',
    OAUTH_BASE_URL: 'account-d.docusign.com',
    // THIS NEEDS TO BE YOUR DOCUSIGN RSA PRIVATE KEY
    PRIVATE_KEY_FILE: './keys/docusign_private_key.txt',

    CHATKIT_API_URL:  `https://us1.pusherplatform.io/services/chatkit/v2/${CHATKIT_INSTANCE_ID}`,
    ACCESS_TOKEN: '',
    LOGIN_ACCOUNT: ''
};