require("dotenv").config();
const express = require("express");
const request = require('request');
const jwt = require('jsonwebtoken');

const userRouter = require("./api/users/user.router");
const xeroRouter = require("./api/xero/xero.router");
const quickbookRouter = require("./api/quickbooks/quickbooks.router");

const AppError = require("./utils/appError");
const {static} = require("express");
const cors = require("cors");

const app = express();
// const path = require('path');
const OAuthClient = require('intuit-oauth');
const {XeroClient} = require("xero-node");
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const ngrok = process.env.NGROK_ENABLED === 'true' ? require('ngrok') : null;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const path = __dirname + '/client/build';
app.use(express.static(path));
// app.use(
//     express.json({
//         // We need the raw body to verify webhook signatures.
//         // Let's compute it only when hitting the Stripe webhook endpoint.
//         verify: function (req, res, buf) {
//             if (req.originalUrl.startsWith('/webhook')) {
//                 req.rawBody = buf.toString();
//             }
//         },
//     })
// );
//
// app.get('/config', (req, res) => {
//     res.send({
//         publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//     });
// });

let corsOptions = {
    origin: process.env.APP_URL
};
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
// app.use(cors());
console.log("Base Url: ",__dirname)

app.use("/api/users", userRouter);
app.use("/api/xero", xeroRouter);
app.use("/api/quickbooks", quickbookRouter);


process.on('uncaughtException', function(error) {
    console.log(error.stack);
});

// url not found
app.all('*', (req, res, next) => {
    res.send(`Error 404: Requested URL ${process.env.DOMAIN}${req.path} not found!`);
})


app.get('/', async (req, res) => {
    res.sendFile(path + "/index.html");
    // res.send("Apis Working");
});

/**
 * Start server on HTTP (will use ngrok for HTTPS forwarding)
 */
const server = app.listen(process.env.PORT || 3008, () => {
    console.log(`💻 Server listening on port ${server.address().port}`);
    if (!ngrok) {
        redirectUri = `${server.address().port}` + '/quickbooks_callback';
        console.log(
            `💳  Step 1 : Paste this URL in your browser : ` +
            'http://localhost:' +
            `${server.address().port}`,
        );
        console.log(
            '💳  Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com',
        );
        console.log(
            `💳  Step 3 : Copy Paste this callback URL into redirectURI :` +
            'http://localhost:' +
            `${server.address().port}` +
            '/quickbooks_callback',
        );
        console.log(
            `💻  Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`,
        );
    }
});
server.setTimeout(500000);
// server.timeout = 0;
console.log("💻 Server timeout", server.timeout);
/**
 * Optional : If NGROK is enabled
 */
// if (ngrok) {
//     console.log('NGROK Enabled');
//     ngrok
//         .connect({ addr: process.env.PORT || 8000 })
//         .then((url) => {
//             redirectUri = `${url}/quickbooks_callback`;
//             console.log(`💳 Step 1 : Paste this URL in your browser :  ${url}`);
//             console.log(
//                 '💳 Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com',
//             );
//             console.log(`💳 Step 3 : Copy Paste this callback URL into redirectURI :  ${redirectUri}`);
//             console.log(
//                 `💻 Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`,
//             );
//         })
//         .catch(() => {
//             process.exit(1);
//         });
// }


// const port = process.env.PORT || 4000;
// app.listen(port, () => {
//     console.log("server up and running on PORT :", port);
// });
//
// app.timeout = 10000;