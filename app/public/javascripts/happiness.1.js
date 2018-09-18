const Chart = (function(window, d3) {
    // Variable declarations
    let data, 
        svg, 
        x, 
        y, 
        xAxis, 
        yAxis, 
        svgWidth, 
        svgHeight, 
        width, 
        height, 
        line, 
        path, 
        touchScale, 
        locator, 
        chartWrapper, 
        firstRender = true,
        margin = {};
    const tickOverrides = [-21, -14, -7, 0, 7, 14, 21];
    const axisImages = [0,1,2,3,4,5,6];
    const breakPoint = 768;

    // Get default data
    // d3.csv("data/happiness-daily.csv", initGraph);
    d3.csv('data/happiness-daily.csv', function(data) {
        // console.log(dataset, typeof dataset);
        return {
            date: new Date(data.date),
            value: +data.happiness
        }
    }).then(function(dataset) {
        console.log(dataset, typeof dataset, dataset.length);
        initGraph(dataset);
    });

    // Function - Initalize graph (csv)
    function initGraph(csv) {
        data = csv;

        // initialize scales
        x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date }));
        y = d3.scaleLinear()
            .domain([-21, 21]);

        // initialize axis
        xAxis = d3.axisBottom()
            .scale(x);
        yAxis = d3.axisLeft()
            .scale(y)
            .tickValues(tickOverrides);

        // path generator for line chart
        line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })

        svg = d3.select("#chart")
            .append("svg")
            .style("pointer-events", "none");

        chartWrapper = svg.append("g")
            .style("pointer-events", "all");

        path = chartWrapper.append("path")
            .datum(data)
            .classed("line", true);

        chartWrapper.append("g").classed("x axis", true);
        chartWrapper.append("g").classed("y axis", true);
        
        // Event Listener - touchmove
        chartWrapper.on("touchmove", onTouchMove);

        // Locator
        locator = chartWrapper.append("circle")
            .style("display", "none")
            .attr("r", 10)
            .attr("fill", "#f00");

        touchScale = d3.scaleLinear();

        // render chart
        render();
        
    }

    // Function - Render graph ()
    function render() {

        // get dimensions based on window
        updateDimensions(window.innerWidth);

        // update x and y scales
        x.range([0, width]);
        y.range([height, 0]);

        touchScale.domain([0, width]).range([0, data.length-1]).clamp(true);

        // update svg elements to new dimensions
        svg.attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);

        chartWrapper.attr("transform", `translate(${margin.left},${margin.top})`);

        // update the axis and line
        xAxis.scale(x);
        yAxis.scale(y);

        if(window.innerWidth < breakPoint) {
            xAxis.ticks(d3.timeMonth.every(2))
        } else {
            xAxis.ticks(d3.timeMonth.every(1))
        }

        svg.select(".x.axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);
  
        svg.select(".y.axis")
            .call(yAxis);
    
        path.attr("d", line);

        if (firstRender) {
            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);
            firstRender = false;
        } else {
            path.attr("stroke-dasharray", null)
                .attr("stroke-dashoffset", null)
        }
        // const totalLength = path.node().getTotalLength();
        // path.attr("stroke-dasharray", totalLength + " " + totalLength)
        //     .attr("stroke-dashoffset", totalLength)
        //     .raise();

        // Draw line transition on page load
        // const lineLoaded = document.getElementById("transitioned");;
        // // console.log(lineLoaded);
        // if(!lineLoaded) {
        //     path.transition()
        //         .duration(2000)
        //         .attr("stroke-dashoffset", 0)
        //         .attr("id", "transitioned");
        // }

        svg.select(".y.axis").selectAll("text").remove();
        svg.select(".y.axis").selectAll("image").remove();

        svg.select(".y.axis").selectAll(".tick")
            .data(axisImages)
            .append("svg:image")
            .attr("xlink:href", function (d) { return "/images/" + d + ".svg"; })
            .attr("id", function(d) { return "icon-" + d; })
            .attr("width", 35)
            .attr("x", -50)
            .attr("y", -(svgHeight/(axisImages.length*2)))
            .attr("height", svgHeight / axisImages.length)
    }

    // Function - Update dimensions (window.innerWidth)
    function updateDimensions(windowWidth) {
        const graphCard = document.getElementById("graphCard");
        const graphCardWidth = parseInt(window.getComputedStyle(graphCard, null).getPropertyValue('width'), 10);
        const graphCardPaddingLeft = parseInt(window.getComputedStyle(graphCard, null).getPropertyValue('padding-left'), 10);
        const graphCardPaddingRight = parseInt(window.getComputedStyle(graphCard, null).getPropertyValue('padding-right'), 10);
        
        svgWidth = graphCardWidth - graphCardPaddingRight - graphCardPaddingLeft;
        if (windowWidth <= 768) {
            svgHeight = 300;
        } else {
            svgHeight = .7 * svgWidth;
        }
        margin = {
            top: 20,
            right: 50,
            bottom: 30,
            left: 50
        };

        height = svgHeight - margin.top - margin.bottom;
        width = svgWidth - margin.right - margin.left;
    }

    // Function - Touchmove event handler
    function onTouchMove() {
        const xPos = d3.touches(this)[0][0];
        const d = data[~~touchScale(xPos)];
    
        locator.attr({
            cx : x(new Date(d.date)),
            cy : y(d.value)
        })
        .style('display', 'block');
    }
    // Function - Update data

    // Event Listener - checkbox
    const dailyWeeklyCheckbox = document.querySelector("#dailyWeeklyCheckbox");

    dailyWeeklyCheckbox.addEventListener("change", function() {
        if (this.checked) {
            console.log("Checkbox checked");
        } else {
            console.log("Unchecked");
        }
    })


    
    return {
        render: render
    }
})(window, d3);

window.addEventListener("resize", Chart.render);

