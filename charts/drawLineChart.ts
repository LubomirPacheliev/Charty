import * as d3 from 'd3';
import getCandleData from './getCandleData';
import responsivefy from './responsivefy';

const drawLineChart = async (symbol, interval, options) => {
    const data = await getCandleData(symbol, interval);

    data.map(datum => {
        if (Array.from(Object.values(datum)).includes(undefined)) throw new Error(`Candle is missing some data.\nReceived: ${datum}`);
        datum.date = datum.date ? new Date(datum.date) : new Date();
        datum.open = Number(datum.open);
        datum.high = Number(datum.high);
        datum.low = Number(datum.low);
        datum.close = Number(datum.close);
    });

    if (options.margin) {
        const margin = options.margin;
        options.marginTop = margin;
        options.marginRight = margin;
        options.marginBottom = margin;
        options.marginLeft = margin;
    }

    enum margin {
        top = options.marginTop ? options.marginTop : 50,
        right = options.marginRight ? options.marginRight : 50,
        bottom = options.marginBottom ? options.marginBottom : 50,
        left = options.marginLeft ? options.marginLeft : 50,
    }

    const width = options.chartWidth ? options.chartWidth : ( window.innerWidth - margin.left - margin.right );
    const height = options.chartHeight ? options.chartHeight : ( window.innerHeight - margin.top - margin.bottom );

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .call(responsivefy)
        .append('g')
        .attr('transform', `translate(${margin.left}), ${margin.top}`);
}

export default drawLineChart;