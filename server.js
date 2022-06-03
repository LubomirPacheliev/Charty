const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('./'));

app.get('/:symbol/:interval', async (req, res) => {
    try {
        const getCandleData = require('./dist/getCandleData.js').default;
        const candleData = await getCandleData(req.params.symbol, req.params.interval);
        res.status(200).send(candleData);
    } catch(e) {
        console.error(e);
        res.status(500);
    }
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/canvas.html');
});

app.listen(port, () => console.log('Tradingview can suck it.'));