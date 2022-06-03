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

    const xMin = d3.min(data, datum => datum.date);
    const xMax = d3.max(data, datum => datum.date);
    const yMin = d3.min(data, datum => datum.close);
    const yMax = d3.max(data, datum => datum.close);

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
        .x(datum => xScale(datum.date))
        .y(datum => yScale(datum.close));

    svg.append('path')
        .data([data])
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5')
        .attr('d', line);

}

export default drawLineChart;