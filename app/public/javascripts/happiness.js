
// const dataSet = [];

d3.csv('data/happiness-daily.csv', function(data) {
    // console.log(dataset, typeof dataset);
    return {
        date: new Date(data.date),
        value: data.happiness
    }
}).then(function(dataset) {
    console.log(dataset, typeof dataset, dataset.length);
    drawChart(dataset);
});

// LINE Chart
function drawChart(data) {
    const svgWidth = 900, svgHeight = 400;
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const tickOverrides = [-21, -14, -7, 0, 7, 14, 21];
    const axisImages = [0,1,2,3,4,5,6];
    const bisectDate = d3.bisector(function(d) { return d.date; }).left;

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
        // .curve(d3.curveBasis)
        .x(function(d) { return x(d.date)})
        .y(function(d) { return y(d.value)})
        x.domain(d3.extent(data, function(d) { return d.date }));
        y.domain([-21, 21]);

    // Create the svg:defs element and the main gradient definition.
    var svgDefs = svg.append('defs');

    var mainGradient = svgDefs.append('linearGradient')
        .attr('id', 'mainGradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%');

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradient.append('stop')
        .attr('class', 'stop-blank')
        .attr('offset', '0');

    mainGradient.append('stop')
        .attr('class', 'stop-green')
        .attr('offset', '.15');

    mainGradient.append('stop')
        .attr('class', 'stop-green')
        .attr('offset', '.35');

    mainGradient.append('stop')
        .attr('class', 'stop-blank')
        .attr('offset', '.5');

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
        .attr("xlink:href", function (d) { return "/images/" + d + ".svg"; })
        .attr("id", function(d) { return "icon-" + d; })
        .attr("width", 35)
        .attr("x", -50)
        .attr("y", -30)
        .attr("height", svgHeight / axisImages.length)

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

    var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle")
        .attr("r", 10)
        .classed("focusCircle", true);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    // svg.append("rect")
    //     .classed('filled', true)
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove)
        .on("touchmove", mousemove)
        // .on("click", updateData);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.transition().duration(45).attr("transform", `translate(${x(d.date) + margin.left}, ${y(d.value) + margin.top})`)
        .select("text").text(d.value).attr("font-size", "50px").attr("y", -40);
    }

    // function updateData() {

    //     // Get the data again
    //     d3.csv('data/happiness-weekly.csv', function(data) {
    //         // console.log(dataset, typeof dataset);
    //         return {
    //             date: new Date(data.date),
    //             value: data.happiness
    //         }
    //     }).then(function(dataset) {
    //         // Scale the range of the data again 
    //         x.domain(d3.extent(dataset, function(d) { return d.date; }));
    //         y.domain([0, d3.max(dataset, function(d) { return d.value; })]);

    //         // Select the section we want to apply our changes to
    //         var svg = d3.select("body").transition();
        
    //         // Make the changes
    //         svg.select(".line")   // change the line
    //             .duration(750)
    //             // .attr("d", valueline(dataset));
    //         svg.select(".x.axis") // change the x axis
    //             .duration(750)
    //             .call(xAxis);
    //         svg.select(".y.axis") // change the y axis
    //             .duration(750)
    //             .call(yAxis);
    
    //     });
        
    // }
    

}
