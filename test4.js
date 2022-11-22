// var margin = {top: 60, right: 100, bottom: 20, left: 80},
//     width = 850 - margin.left - margin.right,
//     height = 370 - margin.top - margin.bottom;

//


let width = 1920,
    height = 1080,
    margin = {top: 100, bottom: 100, left: 100, right: 150}



// Define the line

var svg = d3.select("#graph")
    .append("svg")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "svg");


d3.csv("ready_data.csv", function(error, data) {
    if (error) throw error;
    var parseTime = d3.timeParse("%Y-%m-%d");

    data.forEach(function (d) {
        d.date = parseTime(d.date);
    });
    console.log(data)
    // Format the data
    // console.log(data)
    var nest = d3.nest()
        .key(function(d){
            return d.name;
        })
        .rollup(function(leaves){
            var max = d3.max(leaves, function(d){
                return d.adj_price
            })
            var year = d3.nest().key(function(d){
                return d.name
            })
                .entries(leaves);
            return {max:max, year:year};
        })
        .entries(data)
    console.log(222)
    console.log(nest)
    // data.forEach(function(d) {
    //     console.log(d.date)
    // });
    let y_max = 7,
        x_extent = d3.extent(data.map(d => d.date));


    // console.log(x_extent)

    var x = d3.scaleTime()
        .domain(x_extent)
        .range([margin.left, width - margin.right]);
    var y = d3.scaleLinear()
        .domain([0, y_max])
        .range([height - margin.bottom, margin.top])

    // var valueLine = d3.line()
    //     .x(function(d) {
    //         console.log(4);
    //         console.log(d.date);
    //         console.log(x(d.date));
    //         return x(d.date); })
    //     .y(function(d) {
    //         console.log(5);
    //         console.log(+d.adj_price);
    //         console.log(y(+d.adj_price));
    //         return y(+d.adj_price); })


    var valueLine = d3.line()
        .x(function(d) {
            console.log(4);
            console.log(d.date);
            console.log(x(d.date));
            return x(d.date); })
        .y(function(d) {
            console.log(5);
            console.log(+d.adj_price);
            console.log(y(+d.adj_price));
            return y(+d.adj_price); })
    // Set up the x axis
    var xaxis = svg.append("g")
        .attr("transform",`translate(0,${height - margin.bottom})`)
        .attr("class", "x axis")
        .call(d3.axisBottom(x))



    // Create a dropdown
    var CountryMenu = d3.select("#fruitDropdown")

    CountryMenu
        .append("select")
        .selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })
    var allGroup = ["USD_adjusted", "EUR_adjusted", "JPY_adjusted","CNY_adjusted"]
    var baseMenu = d3.select("#base")
    baseMenu
        .append("select")
        .selectAll("option")
        .data(allGroup)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d;
        })
        .text(function(d){
            return d;
        })
    // console.log(1);
    // console.log(nest)
    // var selectFruit = nest.filter(d => d.key == "China");
    // console.log(selectFruit);
    // Function to create the initial graph
    var initialGraph = function(fruit){
        console.log(fruit)
        // Filter the data to include only fruit of interest
        var selectcountry = nest.filter(function(d){

            if (d.key == fruit){
                console.log(1)
            }
            // console.log(fruit)
            return d.key == fruit;
        })
        console.log(selectcountry)

        var selectFruitGroups = svg.selectAll(".fruitGroups")
            .data(selectcountry, function(d){
                console.log(2)
                console.log(d.key)
                // console.log(this.key)
                return d ? d.key : this.key;
            })
            .enter()
            .append("g")
            .attr("class", "fruitGroups")
            .each(function(d){
                y.domain([0, d.value.max])
            });

        var initialPath = selectFruitGroups.selectAll(".line")
            .data(function(d) {
                console.log(d.value.year);
                return d.value.year; })
            .enter()
            .append("path")

        initialPath
            .attr("d", function(d){
                console.log(3)
                console.log(d.values)
                return valueLine(d.values)
            })
            .attr("class", "line")

        // Add the Y Axis

        var yaxis = svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr("class", "y axis")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSizeInner(0)
                .tickPadding(6)
                .tickSize(0, 0));

        // Add a label to the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 60)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Y")
            .attr("class", "y axis label");

    }

    // Create initial graph
    initialGraph("Argentina")


    // Update the data
    var updateGraph = function(country){

        // Filter the data to include only fruit of interest
        var selectcountry = nest.filter(function(d){
            return d.key == country;
        })

        // Select all of the grouped elements and update the data
        var selectFruitGroups = svg.selectAll(".fruitGroups")
            .data(selectcountry)
            .each(function(d){
                y.domain([0, d.value.max])
            });
        // Select all the lines and transition to new positions
        selectFruitGroups.selectAll("path.line")
            .data(function(d) { return d.value.year; })
            .transition()
            .duration(1000)
            .attr("d", function(d){
                console.log(9999);
                console.log(d.values)
                return valueLine(d.values)
            })

        // Update the Y-axis
        d3.select(".y")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSizeInner(0)
                .tickPadding(6)
                .tickSize(0, 0));




    }


    // Run update function when dropdown selection changes
    CountryMenu.on('change', function(){
        // console.log(6)
        // console.log(this.key)
        // Find which fruit was selected from the dropdown
        var selectedcountry = d3.select(this)
            .select("select")
            .property("value")
        // console.log(7);
        // console.log(selectedcountry)
        // Run update function with the selected fruit
        updateGraph(selectedcountry)

    });
    baseMenu.on('change', function(){
        // Find which fruit was selected from the dropdown
        var selectedbase = d3.select(this)
            .select("select")
            .property("value")
        console.log(7777);
        console.log(selectedbase)
        console.log(d=> d.value.selectedbase)
        // var valueLine2 = d3.line()
        //     .x(function(d) {return x(d.date); })
        //     .y(function(d) {return y(d.selectedbase); })
        // Run update function with the selected fruit
        // updateGraph(selectedFruit)

    });

})

