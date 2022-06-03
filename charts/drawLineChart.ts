//@ts-ignore
const d3 = window.d3 || import('d3');
import getCandleData from './getCandleData';
import responsivefy from './responsivefy';

type Options = {
    margin?: Number,
    marginTop?: Number,
    marginRight?: Number,
    marginBottom?: Number,
    marginLeft?: Number,
    chartWidth?: Number,
    chartHeight?: Number
}

type Datum = {
    date?: Date,
    open?: Number | String,
    high?: Number | String,
    low?: Number | String,
    close?: Number | String
};

console.log('before def of func')

const drawLineChart = async (symbol: string, interval: string, options: Options) => {
    console.log(getCandleData);
    const data = await getCandleData(symbol, interval);

    data.map((datum: Datum) => {
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
        top = Number(options.marginTop ? options.marginTop : 50),
        right = Number(options.marginRight ? options.marginRight : 50),
        bottom = Number(options.marginBottom ? options.marginBottom : 50),
        left = Number(options.marginLeft ? options.marginLeft : 50),
    }

    const width = Number(options.chartWidth ? options.chartWidth : ( window.innerWidth - margin.left - margin.right));
    const height = Number(options.chartHeight ? options.chartHeight : ( window.innerHeight - margin.top - margin.bottom));

    const svg = d3
        .select('.chart')
        .append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .call(responsivefy)
        .append('g')
        .attr('transform', `translate(${margin.left}), ${margin.top}`);

    const xMin = d3.min(data, (datum: Datum) => datum.date);
    const xMax = d3.max(data, (datum: Datum) => datum.date);
    const yMin = d3.min(data, (datum: Datum) => datum.close);
    const yMax = d3.max(data, (datum: Datum) => datum.close);

    const xScale = d3.scaleTime().domain([xMin, xMax]).range([0, width]);
    const yScale = d3.scaleLinear().domain(yMin - 5, yMax).range([height, 0]);

    svg.append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    svg.append('g')
        .attr('id', 'yAxis')
        .attr('transform', `translate(${width}, 0)`)
        .call(d3.axisRight(yScale));

    const line = d3
        .line()
        .x((datum: Datum) => xScale(datum.date))
        .y((datum: Datum) => yScale(datum.close));

    svg.append('path')
        .data([data])
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5')
        .attr('d', line);
}

(async () => {
    await drawLineChart('BTCUSDT', '1h', {});   
})();