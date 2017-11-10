const express = require('express'),
    path = require('path'),
    requestPromise = require('request-promise'),
    fs = require('fs'),
    rfs = require('rotating-file-stream'),
    morgan = require('morgan'),
    app = express();

// import middleware
const proxyRequestHandler = require('./middleware/proxyRequestHandler');

var logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '7d', // rotate weekly
    path: logDirectory
});

//app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms\\n--BODY--\\n:res[body]\\n\\n', { stream: accessLogStream }));

app.use('/', express.static('public'));

app.get('/_ah/health', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    return res.json({
        message: 'This proxyist service is healthy'
    });
});

app.get('/test/estimote/:authToken/:format',
    (req, res, next) => {
        // get auth token 
        const { authToken, format } = req.params;
        console.info('Basic auth header token: %s', authToken);
        next();
    },
    proxyRequestHandler);

const PORT = process.env.PORT || 8080;

// @TODO handle logging (or perhaps not?)
app.listen(PORT, () => console.info(`The Proxyist is listening @ ${PORT}`));

