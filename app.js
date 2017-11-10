const express = require('express'),
    app = express();

app.use('/', express.static('public'));

app.get('/_ah/health', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    return res.json({
        message: 'Hello World'
    });
});

const PORT = process.env.PORT || 8080;

// @TODO handle logging (or perhaps not?)
app.listen(PORT, () => console.info(`The Proxyist is listening @ ${PORT}`));

