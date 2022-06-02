import d3 from 'd3';

const drawChart = (data, options) => {
    data.map(datum => {
        if (Array.from(Object.values(datum)).includes(undefined)) throw new Error(`Candle is missing some data.\nReceived: ${datum}`);
        datum.date = datum.date ? new Date(datum.date) : new Date();
        datum.open = Number(datum.open);
        datum.high = Number(datum.high);
        datum.low = Number(datum.low);
        datum.close = Number(datum.close);
    });
        
    const chartWidth = options.chartWidth ? options.chartWidth : 1000;
    const chartHeight = options.chartHeight ? options.chartHeight : 800;
    const margin = options.margin ? options.margin : 50;
    const candleMargin = options.candleMargin ? options.candleMargin : 23;
    const canvas = d3.select('div.chart').append('svg').attr('height', chartHeight).attr('width', chartWidth);
    const ticks = data.length / (data.length / 10);

    const x = d3.scaleTime().range([margin, chartWidth - margin]);
    const y = d3.scaleLinear().range([chartHeight - margin, margin]);
    x.domain(d3.extent(data.map(datum => datum.date)));
    y.domain([0, d3.max(data.map(x => x.high * 2))]);

    const xAxis = d3.axisBottom().scale(x).ticks(ticks).tickSizeInner(0);
    canvas.append('g').classed('x-axis', true)
        .attr('transform', d => `translate(${margin}, ${Number(chartHeight - margin)})`)
        .append('rect')
        .attr('fill', 'black')
        .attr('width', chartWidth)
        .attr('height', margin * 1.2)
        .attr('transform', d => `translate(0, ${-margin / 2})`);
    d3.select('.x-axis').call(xAxis);
    
    const yAxis = d3.axisLeft().scale(y).ticks(ticks * 1.5);
    canvas.append('g').classed('y-axis', true)
        .attr('transform', d => `translate(${margin}, 0)`)
        .append('rect')
        .attr('fill', 'black')
        .attr('width', margin * 1.2)
        .attr('height', chartHeight)
        .attr('transform', d => `translate(${-margin}, 0)`);
    d3.select('.y-axis').call(yAxis);

    const panContainer = 
        canvas.append('g')
        .classed('pan-container', true)
        .attr('transform', d => `translate(${margin}, 0)`)
        .attr('width', chartWidth - margin)
        .attr('height', chartHeight - margin);
    const panActionContainerFill = `rgba(255, 255, 255, 0.01)`;
    const panActionContainer = 
        panContainer.append('rect')
        .classed('pan-action-container', true)
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', panActionContainerFill);

    const xGrid = d3.axisBottom().scale(x).ticks(ticks, '').tickSizeInner(Number.MAX_VALUE);
    panContainer.append('g').classed('x-grid', true).attr('transform', d => `translate(0, ${margin})`).call(xGrid);
    const yGrid = d3.axisLeft().scale(y).tickFormat('').ticks(ticks).tickSizeInner(-Number.MAX_VALUE);
    panContainer.append('g').classed('y-grid', true).call(yGrid);
    
    const candleGroup = panContainer.append('g').classed('candle-group', true);
    candleGroup.selectAll('rect.candle')
        .data(data)
        .enter()
        .append('rect')
        .classed('candle', true)
        .attr('width', datum => 0.7 * (chartWidth - 2 * margin) / data.length)
        .attr('height', datum => {
            const height = y(d3.min([datum.open, datum.close])) - y(d3.max([datum.open, datum.close]));
            return height >= 0 ? height : 0;
        })
        .attr('x', datum => x(datum.date) / 2 + margin + candleMargin)
        .attr('y', datum => y(d3.max([datum.open, datum.close])))
        .attr('fill', datum => datum.open > datum.close ? 'red' : 'green');

    const handlePan = e => {
        const translate = e.transform;
        d3.select('.pan-container .x-grid').attr('transform', translate);
        d3.select('.pan-container .y-grid').attr('transform', translate);
        candleGroup.attr('transform', translate);
    };
    const highestTickValue = Number(d3.select('body > div > svg > g.y-axis > g:last-child > text').node().innerHTML);
    const panTranslateExtent = [[0, -yAxis.scale()(highestTickValue)], [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]];
    const pan = d3.zoom().on('zoom', handlePan).translateExtent(panTranslateExtent);
    panContainer.call(pan).on('wheel.zoom', null).on('dblclick.zoom', null);

    const handleAxisDragY = dragEventY => {
        const lastTransform = d3.zoomIdentity;
        const chartDragStart = lastTransform.y;
        let finalPerc;

        const handleAxisPanYEnd = panEventY => {
            const newTransform = lastTransform;
            newTransform.x = dragEventY.sourceEvent.clientX;
            newTransform.y = dragEventY.sourceEvent.clientY;
            const updatedScale = newTransform.rescaleY(y);
            const percFromDragStart = ((newTransform.y - chartDragStart) / chartDragStart) * 100;
            finalPerc = percFromDragStart;

            const lastDomainMax = updatedScale.domain()[1];
            const newDomainMax = 
                newTransform.y <= lastTransform.y 
                ? lastDomainMax * ( 1 + ( finalPerc / 100 ) )
                : lastDomainMax * ( 1 - ( finalPerc / 100 ) );
            const lastDomainMin = updatedScale.domain()[0];
            const newDomainMin = 
                newTransform.y <= lastTransform.y 
                ? lastDomainMin + ( newDomainMax - lastDomainMax )
                : lastDomainMin - ( newDomainMax - lastDomainMax );
            updatedScale.domain([newDomainMin, newDomainMax]);

            yAxis.scale(updatedScale);
            d3.select('.y-axis').call(yAxis);
            yGrid.scale(updatedScale);
            d3.select('.y-grid').call(yGrid);
            d3.selectAll('rect.candle').each((datum, index, group) => { // TODO: Find a better way to update the candles | snapshot is an idea | react states maybe
                group[index].setAttribute('y', updatedScale(d3.max([datum.open, datum.close])));
                const height = 
                    updatedScale(d3.min([datum.open, datum.close])) - updatedScale(d3.max([datum.open, datum.close])) >= 0
                    ? updatedScale(d3.min([datum.open, datum.close])) - updatedScale(d3.max([datum.open, datum.close])) : 0;
                group[index].setAttribute('height', height);
            });
        }

        const axisPanY = d3.zoom()
            .on('zoom', handleAxisPanYEnd)
            .translateExtent([[0, 0], [0, Number.MAX_SAFE_INTEGER]]); //x1, y1, x2, y2
        d3.select('.y-axis').call(axisPanY).on('wheel.zoom', null).on('dbclick.zoom', null);
    }
    const axisDragY = d3.drag().on('start', handleAxisDragY);
    d3.select('.y-axis').call(axisDragY);

    // TODO: Candle Wicks
}

(async () => {
    const symbol = 'BTCUSDT', interval = `4h`;
    const candleData = await (await fetch(`/${symbol}/${interval}`)).json();
    drawChart(candleData, {});
})();