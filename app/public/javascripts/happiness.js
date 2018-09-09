
// const dataSet = [];

d3.csv('data/HappinessData.csv', function(data) {
    // console.log(dataset, typeof dataset);
    return {
        date: new Date(data.Date),
        happiness: data.Happiness
    }
}).then(function(dataset) {
    console.log(dataset, typeof dataset, dataset.length);


// var dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];

var svgWidth = 500, svgHeight = 500, barPadding = 1;
var barWidth = (svgWidth / dataset.length);


var svg = d3.select('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    
var barChart = svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("y", function(d) {
         return svgHeight - d.happiness 
    })
    .attr("height", function(d) { 
        return d.happiness; 
    })
    .attr("width", barWidth - barPadding)
    .attr("transform", function (d, i) {
        var translate = [barWidth * i, 0]; 
        return "translate("+ translate +")";
    });
})
