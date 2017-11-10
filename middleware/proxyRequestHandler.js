const requestPromise = require('request-promise');

module.exports = (req, res) => {
    // get auth token 
    const { authToken, format } = req.params;
    // console.info('Basic auth header token: %s', authToken);
    // build request
    const cf = {
        uri: 'https://cloud.estimote.com/v2/devices',
        method: 'GET',
        headers: {
            Authorization: `Basic ${authToken}`
        },
        //json: true,
        resolveWithFullResponse: true
    };
    requestPromise(cf)
        .then((response) => {
            let body;
            //console.info('Estimote Response -> %s', JSON.stringify(response));
            switch (String(format).toLowerCase()) {
                case 'json':
                default:
                    // parse body as JSON
                    body = JSON.parse(response.body);
                    console.info('Response (JSON) -> %o', body);
                    //res.set('Content-Type', 'application/json');
                    return res.json(body);
            }
            // log response to files
            return res.send(body);
        })
        .catch((err) => {
            console.error('Something went wrong proxying the request -> %o', err);
        });
}