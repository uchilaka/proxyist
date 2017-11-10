const express = require('express'),
    path = require('path'),
    requestPromise = require('request-promise'),
    fs = require('fs'),
    rfs = require('rotating-file-stream'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    CORS = require('cors')
    ;

// initialize app
const app = express();

// configure cors: https://www.npmjs.com/package/cors#configuration-options
const domainWhitelist = ['http://localhost'];
const corsOptions = {
    origin: function (origin, callback) {
        //console.info('CORS request origin: %s', origin);
        // allow for chrome extensions
        if (/^(chrome-extension:\/\/|http:\/\/localhost(\:\d+)?)/.test(origin)) {
            return callback(null, true);
        }

        if (domainWhitelist.indexOf(origin) !== -1) {
            return callback(null, true)
        }

        return callback(new Error(`Not allowed by CORS - ${origin} is a restricted domain`))
        // all allowed, for now
        //callback(null, true);
    },
    // some legacy browsers (IE11, various SmartTVs) choke on 204
    optionalSuccessStatus: 200 // default 204
}
// allow CORS for ALL endpoints
app.use(CORS(corsOptions));

// import middleware
const proxyRequestHandler = require('./middleware/proxyRequestHandler');

// setup logging
var logDirectory = path.join(__dirname, 'log');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '7d', // rotate weekly
    path: logDirectory
});
//app.use(morgan('combined', { stream: accessLogStream }));
app.use((req, res, next) => {
    // @TODO figure out how to get body data in here (:res[body] not working)
    let morganFormat = ':method :url :status :res[content-length] - :response-time ms\\n--BODY--\\n:req[body]\\n';
    switch (String(req.method).toLowerCase()) {
        case 'get':
            // forcing ALL requests to uset the same logging format, for now    
            //default:
            morganFormat = ':method :url :status :res[content-length] - :response-time ms';
            break;
    }
    morgan(morganFormat, { stream: accessLogStream })(req, res, next);
});

// serve static files
app.use('/', express.static('public'));

// setup parsing for requests (POST, PUT etc.)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// configure endpoints
app.get('/_ah/health', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    return res.json({
        message: 'This proxyist service is healthy'
    });
});

app.all('/fetch/:format',
    (req, res, next) => {
        const { authToken, format } = req.params;
        switch (String(req.method).toLowerCase()) {
            /*
            case 'get':
                req.payload = req.query;
                break;
            */

            case 'post':
                // do nothing - payload will automatically be processed at next step    
                break;

            default:
                res.status = 400;
                res.statusMessage = "Request method not supported";
                return res.json({
                    error: 'Request method not supported'
                });
        }
        console.info('(Passthrough) Basic auth header token: %s', authToken);
        next();
    },
    proxyRequestHandler);

app.get('/test/estimote/:authToken/:format',
    (req, res, next) => {
        // get auth token 
        const { authToken, format } = req.params;
        // @TODO perhaps check authentication header for proxying service for security(?)
        console.info('(Passthrough) Basic auth header token: %s', authToken);
        req.payload = {
            uri: 'https://cloud.estimote.com/v2/devices',
            method: 'GET',
            /*
            headers: {
                Authorization: `Basic ${authToken}`
            },
            */
            //json: true,
            resolveWithFullResponse: true
        };
        next();
    },
    proxyRequestHandler);

const PORT = process.env.PORT || 8080;

// @TODO handle logging (or perhaps not?)
app.listen(PORT, () => console.info(`The Proxyist is listening @ ${PORT}`));

