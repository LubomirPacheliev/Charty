import fetch from 'isomorphic-fetch';

const getCandleData = async (symbol, interval) => {
    symbol = symbol.toUpperCase();
    if (!symbol.match(/\w{5,9}/gm)) return new Error('Invalid symbol.');

    const binance = 'https://api.binance.us';
    const url = `${binance}/api/v3/klines?symbol=${symbol}&interval=${interval}`;

    try {
        const resp = await fetch(url);
        const parsed = await resp.json();
        const data = parsed.map(datum => {
            return {
                open: Number(Number(datum[1]).toFixed(2)),
                high: Number(Number(datum[2]).toFixed(2)),
                low: Number(Number(datum[3]).toFixed(2)),
                close: Number(Number(datum[4]).toFixed(2)),
                date: new Date(datum[6])
            }
        });
        return data;
    } catch(e) {
        return console.error(e);
    }
}

export default getCandleData;