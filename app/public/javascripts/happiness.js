
// const dataSet = [];

d3.csv('data/HappinessData.csv', function(data) {
    // console.log(dataset, typeof dataset);
    return {
        date: new Date(data.Date),
        value: data.Happiness
    }
}).then(function(dataset) {
    console.log(dataset, typeof dataset, dataset.length);
    drawChart(dataset);
});

// LINE Chart
function drawChart(data) {
    const svgWidth = 700, svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const tickOverrides = [-21, -14, -7, 0, 7, 14, 21];
    const axisImages = ["0.svg","1.svg","2.svg","3.svg","4.svg","5.svg","6.svg",]

    const svg = d3.select('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight);
        
    const g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .rangeRound([0, width]);

    const y = d3.scaleLinear()
        .rangeRound([height, 0]);

    const line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date)})
        .y(function(d) { return y(d.value)})
        x.domain(d3.extent(data, function(d) { return d.date }));
        y.domain([-21, 21]);

    // g.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x))
    //     .classed("axis", true)
    //     .select(".domain")
    //     .remove();

    // g.append("g")
    //     .call(d3.axisLeft(y))
    //     .classed("axis", true)
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     // .append("text")
    //     // .attr("fill", "#000")
    //     // .attr("transform", "rotate(-90)")
    //     // .attr("y", 6)
    //     // .attr("dy", "0.71em")
    //     // .attr("text-anchor", "end")
    //     // .text("Happiness Score");

    var x_axis = d3.axisBottom().scale(x);

    var y_axis = d3.axisLeft().scale(y).tickValues(tickOverrides);
            
    svg.append("g")
        .attr("transform", "translate(50, 20)")
        .classed("axis", true)
        .call(y_axis);
            
    var xAxisTranslate = svgHeight - 30;
            
    svg.append("g")
        .attr("transform", "translate(50, " + xAxisTranslate  +")")
        .classed("axis", true)
        .call(x_axis);

    svg.select(".axis").selectAll("text").remove();

    var ticks = svg.select(".axis").selectAll(".tick")
        .data(axisImages)
        .append("svg:image")
        .attr("xlink:href", function (d) { return "/images/" + d; })
        .attr("width", 30)
        .attr("x", -50)
        .attr("y", -30)
        .attr("height", svgHeight / axisImages.length);

    const path = g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#474747")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", line);

    const totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);

    g.on("click", function(){
        path      
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", totalLength);
    });
}
