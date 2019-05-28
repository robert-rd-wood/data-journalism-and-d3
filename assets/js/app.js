// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth / 2.5;
    var svgHeight = svgWidth *3/4;

    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read CSV
    d3.csv("/assets/data/data.csv")
        .then(function(data) {

        console.log(data);

        // Cast all numerical elements as numbers
        data.forEach(function(data) {
            data.id = +data.id;
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });
    

        // id
        // state
        // abbr
        // poverty
        // age
        // income
        // healthcare
        // obesity
        // smokes


        // get extents and ranges
        var xExtent = d3.extent(data, function(d) { return d.poverty; });
        var xRange = xExtent[1] - xExtent[0];

        var yExtent = d3.extent(data, function(d) { return d.healthcare; });
        var yRange = yExtent[1] - yExtent[0];

        // set domain to be extent +- 10%
        var xLinearScale = d3.scaleLinear()
            .domain([xExtent[0] - (xRange * .1), xExtent[1] + (xRange * .1)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([yExtent[0] - (yRange * .1), yExtent[1] + (yRange * .1)])
            .range([height, 0]);

        // create axes
        var xAxis = d3.axisBottom(xLinearScale).ticks(6);
        var yAxis = d3.axisLeft(yLinearScale).ticks(6);

        // append axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        chartGroup.append("g")
            .call(yAxis);

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", svgWidth/80)  // Circle size scaled by svg width
            .attr("class", "stateCircle")
            .attr("stroke-width", "1");

        console.log(circlesGroup);

        // Add Text Labels
        var textGroup = chartGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d.poverty))  // Returns scaled location of x
            .attr("y", d => yLinearScale(d.healthcare)+(svgHeight/160))  // Returns scaled location of y (also scaled by font size)
            .attr("class", "stateText")
            .attr("font-size", `${svgWidth/80}px`);  // Font size scaled by circle radius

        console.log(textGroup);

        // Step 1: Initialize Tooltip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .attr("font-size", `${svgWidth/800}px`)
            .direction('w')
            .html(function(d) {
                return (`<strong>${d.state}</strong></br>Poverty: ${d.poverty}%</br>Lacks Healthcare: ${d.healthcare}%`);
            });

        // Step 2: Create the tooltip in chartGroup.
        chartGroup.call(toolTip);

        // Step 3: Create "mouseover" event listener to display tooltip
        circlesGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
        })
        // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
            toolTip.hide(d);
        });

    });

}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
