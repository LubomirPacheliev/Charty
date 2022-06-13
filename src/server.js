import express from 'express';
import path from 'path';
import getCandleData from '../dist/getCandleData.js';

const app = express();
const port = 3000;

app.use(express.static(path.resolve('./')));

app.get('/:symbol/:interval', async (req, res) => {
    try {
        const candleData = await getCandleData(req.params.symbol, req.params.interval);
        res.status(200).send(candleData);
    } catch (e) {
        console.error(e);
        res.status(500);
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve('./canvas.html'));
});

app.listen(port, () => console.log('Tradingview can suck it.'));