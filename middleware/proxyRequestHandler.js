const requestPromise = require('request-promise');

module.exports = (req, res) => {
    // get auth token 
    const { authToken, format } = req.params;
    let withMetadata = false;

    if (req.query)
        withMetadata = req.query.withMetadata;

    console.info('Request body -> %o', req.body);
    // console.info('Basic auth header token: %s', authToken);
    let cf = Object.assign({}, {
        method: 'GET',
        headers: {
            accepts: 'application/json'
        },
        resolveWithFullResponse: true
    }, req.body);
    // process in payload last, if available
    if (req.payload)
        cf = Object.assign({}, cf, req.payload);

    console.info('Payload to relay: %o', cf);

    let authHeader;
    if (authToken) {
        const tokenparts = authToken.split(/[\s:,]/);
        if (tokenparts.length > 1) {
            authHeader = `${tokenparts[0]} ${tokenparts[1]}`;
        } else
            authHeader = `Basic ${tokenparts[0]}`;
    }

    if (authHeader)
        cf['headers']['Authorization'] = authHeader;

    // build request
    requestPromise(cf)
        .then((response) => {
            let body;
            //console.info('Estimote Response -> %s', JSON.stringify(response));
            switch (String(format).toLowerCase()) {
                case 'json':
                default:
                    // parse body as JSON
                    body = JSON.parse(response.body);

                    if (!withMetadata)
                        return res.json(body);

                    console.info('Response found (JSON) -> %o', (body !== null && body !== undefined));
                    //res.set('Content-Type', 'application/json');
                    return res.json({
                        formatRequested: format,
                        request: cf,
                        json: body
                    });
            }
            // log response to files
            return res.send(body);
        })
        .catch((err) => {
            console.error('Something went wrong proxying the request -> %o', err);
        });
}