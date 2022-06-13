import express, { Request, Response } from 'express';
import path from 'path';
import getCandleData from './charts/getCandleData';

const app = express();
const port = 3000;

app.use(express.static(path.resolve('./')));

app.get('/:symbol/:interval', async (req: Request, res: Response) => {
    try {
        const candleData = await getCandleData(req.params.symbol, req.params.interval);
        res.status(200).send(candleData);
    } catch (e) {
        console.error(e);
        res.status(500);
    }
});

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve('./canvas.html'));
});

app.listen(port, () => console.log('Tradingview can suck it.'));