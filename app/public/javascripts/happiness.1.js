const Chart = (function(window, d3) {
    // Variable declarations
    let data,
        data2,
        dataDaily, 
        dataWeekly,
        dataToRender,
        dataHover,
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
        weeklyCheckboxChecked = false;
    const margin = {
        top: 20,
        right: 50,
        bottom: 30,
        left: 50
    };
    const tickOverrides = [-21, -14, -7, 0, 7, 14, 21];
    const axisImages = [0,1,2,3,4,5,6];
    const breakPoint = {
        small: 576,
        medium: 768,
        large: 992,
        extraLarge: 1200
    }

    const bisectDate = d3.bisector(function(d) { return d.date; }).left;
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get default data
    // d3.csv("data/happiness-daily.csv", initGraph);
    d3.csv('data/happiness-weekly.csv', function(data) {
        // console.log(dataset, typeof dataset);
        return {
            date: new Date(data.date),
            value: +data.happiness
        }
    }).then(function(dataset) {
        console.log(dataset, typeof dataset, dataset.length);
        dataWeekly = dataset;
        d3.csv('data/happiness-daily.csv', function(data) {
            // console.log(dataset, typeof dataset);
            return {
                date: new Date(data.date),
                value: +data.happiness
            }
        }).then(function(dataset2) {
            console.log(dataset2, typeof dataset2, dataset2.length);
            dataDaily = dataset2;
            initGraph(dataDaily);
        });
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
            .curve(d3.curveCatmullRom)
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
        // chartWrapper.on("mousemove", onTouchMove);
        
        // Locator
        locator = chartWrapper.append("circle")
            .style("display", "none")
            .attr("r", 10)
            .classed("focusCircle", true)
            // .attr("fill", "#f00");

        touchScale = d3.scaleLinear();

        // render chart
        render();
        
    }

    // Function - Render graph ()
    function render() {

        // get dimensions based on window
        updateDimensions(window.innerWidth);
        
        dataToRender = currentDataSet();
        path.datum(dataToRender);

        // update x and y scales
        x.range([0, width]);
        y.range([height, 0]);

        touchScale.domain([0, width]).range([0, dataToRender.length-1]).clamp(true);

        // update svg elements to new dimensions
        svg.attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);

        chartWrapper.attr("transform", `translate(${margin.left},${margin.top})`);

        // update the axis and line
        xAxis.scale(x);
        yAxis.scale(y);

        if(window.innerWidth < breakPoint.small) {
            xAxis.ticks(d3.timeMonth.every(3))
        } else if (window.innerWidth > breakPoint.small && window.innerWidth < breakPoint.medium) {
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

        // Draw line transition on page load first render
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

        svg.select(".y.axis").selectAll("text").remove();
        svg.select(".y.axis").selectAll("image").remove();
        svg.select(".x.axis").selectAll("text").classed("x-tick-text", true);

        if (window.innerWidth < breakPoint.small) {
            svg.select(".y.axis").selectAll(".tick")
            .data(axisImages)
            .append("svg:image")
            .classed("y-axis-images", true)
            .attr("xlink:href", function (d) { return "/images/" + d + ".svg"; })
            .attr("id", function(d) { return "icon-" + d; })
            .attr("width", 30)
            .attr("x", -40)
            .attr("y", -(svgHeight/(axisImages.length*2)))
            .attr("height", svgHeight / axisImages.length);
        } else {
            svg.select(".y.axis").selectAll(".tick")
            .data(axisImages)
            .append("svg:image")
            .classed("y-axis-images", true)
            .attr("xlink:href", function (d) { return "/images/" + d + ".svg"; })
            .attr("id", function(d) { return "icon-" + d; })
            .attr("width", 35)
            .attr("x", -50)
            .attr("y", -(svgHeight/(axisImages.length*2)))
            .attr("height", svgHeight / axisImages.length);
        }

        const focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");
      
        focus.append("circle")
            .attr("r", 10)
            .classed("focusCircle", true);
    
        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");
      
        svg.append("rect")
              .attr("class", "overlay")
              .attr("width", width)
              .attr("height", height)
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .on("mouseover", function() { focus.style("display", null); })
              .on("mouseout", function() { focus.style("display", "none"); })
              .on("mousemove", mousemove)
              .on("touchmove", mousemove)

        const levelDescriptors = svg.append("g")
            .classed("levelDescriptor", true)
            .style("display", "none");

        levelDescriptors.append("rect")
            .attr("height", 10)
            .attr("width", 30)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .classed("levelDescriptorBox", true);
    
        levelDescriptors.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");

        svg.select(".y.axis").selectAll("image")
              .on("mouseover", function() { levelDescriptors.style("display", null); })
              .on("mouseout", function() { levelDescriptors.style("display", "none"); })
              .on("mousemove", onYAxisTickHover)
              .on("touchmove", onYAxisTickHover)

        renderLabels();
      
        function mousemove() {
            dataHover = currentDataSet();
            const x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(dataHover, x0, 1),
                d0 = dataHover[i - 1],
                d1 = dataHover[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.transition().duration(45).attr("transform", `translate(${x(d.date) + margin.left}, ${y(d.value) + margin.top})`)
            .select("text").text(`${d.value} ${monthNames[d.date.getMonth()]} ${d.date.getDate()}`).attr("font-size", "50px").attr("y", -40);
            
        }

        function onYAxisTickHover(tickNumber) {
            console.log("Tick Hover on tick", tickNumber);
        }

    }

    const labels = [
        {
            x: new Date('06-01-2018'),
            y: .17,
            text: 'Test Label 1',
            orient: 'left'
        },
        {
            x: new Date('07-20-2018'),
            y: .24,
            text: 'Test Label 2',
            orient: 'left'
        }
    ]
    
      function renderLabels() {
    
        const _labels = chartWrapper.selectAll('text.label');

        if(!_labels.length > 0) {
          _labels
            .data(labels)
            .enter()
            .append('text')
            .classed('label', true)
            .attr('x', function(d) { return x(d.x) })
            .attr('y', function(d) { return y(d.y) })
            .style('text-anchor', function(d) { return d.orient == 'right' ? 'start' : 'end' })
            .text(function(d) { return d.text });
        }
        _labels
                .attr('x', function(d) { return x(d.x) })
                .attr('y', function(d) { return y(d.y) })
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

        height = svgHeight - margin.top - margin.bottom;
        width = svgWidth - margin.right - margin.left;
    }

    // Function - Touchmove event handler
    function onTouchMove() {
        console.log("TouchMove Called")
        const xPos = d3.touches(this)[0][0];
        const d = data[~~touchScale(xPos)];
    
        locator.attr({
            cx : x(new Date(d.date)),
            cy : y(d.value)
        })
        .style('display', 'block');
    }

    // Function - Update data
    function updateData(isChecked) {
        weeklyCheckboxChecked = isChecked;

        // if (weeklyCheckboxChecked) {
        //     data2 = dataWeekly;
        // } else {
        //     data2 = dataDaily;
        // }
        data2 = currentDataSet();

        if (weeklyCheckboxChecked) {
            d3.select(".switch-label").text("Weekly Average");
        } else {
            d3.select(".switch-label").text("Daily Scores");
        }
        svg.select(".line")
            .transition()
            .duration(750)
            .attrTween('d', function () { 
            return d3.interpolatePath(d3.select(this).attr('d'), line(data2)); 
        })
        // render();
    }

    function currentDataSet() {
        if (weeklyCheckboxChecked) {
            return dataWeekly;
        } else {
            return dataDaily;
        }
    }

    // Event Listener - checkbox
    const dailyWeeklyCheckbox = document.querySelector("#dailyWeeklyCheckbox");

    dailyWeeklyCheckbox.addEventListener("change", function() {
        updateData(this.checked);
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

