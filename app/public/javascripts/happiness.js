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
        dateAndScoreBox,
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

        dateAndScoreBox = svg.append("g");

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

        const hasScoreBox = dateAndScoreBox.selectAll("text");
        console.log("hasScoreBox", hasScoreBox.size())

        if (hasScoreBox.empty()) {
            dateAndScoreBox.append("text")
            // .text("win")
            // .append("rect")
            // .attr("height", svgHeight/(axisImages.length))
            // .attr("width", 100)
            // .attr("fill", "none")
            .attr("transform", `translate(${margin.left*1.5}, ${(svgHeight*6)/(axisImages.length)})`);
        }

        const levelDescriptors = svg.append("g")
            .classed("levelDescriptor", true)
            .style("display", "none");

        levelDescriptors.append("rect")
            // .attr("rx", 15)
            .attr("x", margin.left/3)
            .attr("class", "description-overlay")
            .attr("height", svgHeight/(axisImages.length))
            .attr("width", 100)
            // .attr("fill", "none")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .classed("levelDescriptorBox", true);
    
        if (window.innerWidth < breakPoint.large) {
            levelDescriptors.append("text")
            .attr("x", margin.left/2)
            // .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr("dy", "1em");
        } else {
            levelDescriptors.append("text")
            .attr("x", margin.left/2)
            .attr("dy", "1.5em");
        }


        svg.select(".y.axis").selectAll("image")
            .on("mouseover", function() { levelDescriptors.style("display", null); })
            .on("mouseout", function() { levelDescriptors.style("display", "none"); })
            .on("mousemove", onYAxisTickHover)
            .on("touchmove", onYAxisTickHover)

        // renderLabels();
      
        function mousemove() {
            dataHover = currentDataSet();
            const x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(dataHover, x0, 1),
                d0 = dataHover[i - 1],
                d1 = dataHover[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.transition().duration(45).attr("transform", `translate(${x(d.date) + margin.left}, ${y(d.value) + margin.top})`)
            if (weeklyCheckboxChecked) {
                dateAndScoreBox.select("text").text(`Score: ${d.value} (Week of ${monthNames[d.date.getMonth()]} ${d.date.getDate()}, ${d.date.getFullYear()})`).attr("font-size", "15px").attr("y", -40);
            } else {
                dateAndScoreBox.select("text").text(`Score: ${d.value} (${monthNames[d.date.getMonth()]} ${d.date.getDate()}, ${d.date.getFullYear()})`).attr("font-size", "15px").attr("y", -40);
            }
            // .select("text").text(`${d.value} ${monthNames[d.date.getMonth()]} ${d.date.getDate()}`).attr("font-size", "50px").attr("y", -40);
            
        }   

        function onYAxisTickHover(tickNumber) {
            console.log("Tick Hover on tick", tickNumber);
            console.log((svgHeight*(6-tickNumber)) / axisImages.length);
            levelDescriptors.select(".description-overlay")
                .attr("y", ((svgHeight*(6-tickNumber)) / axisImages.length))
                .attr("width", 150);
            switch(tickNumber) {
                case 0:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Extremely Horrible (-20)")
                        .attr("id", "extreme-text");
                        // .classed("warning-text", true);
                    break;
                case 1:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Terrible (-14)")
                        .attr("id", "terrible-text");
                        // .classed("caution-text", true);
                    break;
                case 2:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Bad (-7)")
                        .attr("id", "bad-text");
                        // .classed("caution-text", true);
                    break;
                case 3:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Blah (0)")
                        .attr("id", "blah-text");
                        // .classed("neutral-text", true);
                    break;
                case 4:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Good (+7)")
                        .attr("id", "good-text");
                        // .classed("positive-text", true);
                    break;
                case 5:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Amazing (+14)")
                        .attr("id", "amazing-text");
                        // .classed("positive-text", true);
                    break;
                case 6:
                    levelDescriptors.select("text")
                        .attr("transform", `translate(${margin.left}, ${(svgHeight*(6-tickNumber) / axisImages.length)})`)
                        .text("Manic Episode Risk (+20)")
                        .attr("id", "manic-text");
                        // .classed("caution-text", true);
                    break;

            }
        }

    }

    const labels = [
        {
            x: new Date('06-01-2018'),
            y: .2,
            text: 'High Point',
            orient: 'left'
        },
        {
            x: new Date('07-20-2018'),
            y: .3,
            text: 'Low Point',
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

