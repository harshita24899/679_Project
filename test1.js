
function visualize(data) {
    var parseTime = d3.timeParse("%Y-%m-%d");

    data.forEach(function (d) {
        d.date = parseTime(d.date);
    });

    const sumstat = d3.groups(data, d => d.name); // nest function allows to group the calculation per level of a factor
    console.log(sumstat)
    var basemenu = d3.select("#basecurrency")

    basemenu
        .append("select")
        .selectAll("option")
        .data(sumstat)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d[0];
        })
        .text(function(d){
            return d[0];
        })
    basemenu.on('change', function(){

        // Find which fruit was selected from the dropdown
        var selectedbase = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected fruit
        console.log(selectedbase)

    });

    // const sumstat = d3.flatGroup(data, d => d.name);
    data = d3.map(sumstat,d=>d[1])
    console.log(data);
    console.log(data.flat());
    let scales = make_scales(data);
    draw_line(data, scales);
    add_axes(scales);
    add_voronoi(data.flat(), scales);
    }


function draw_line(data, scales) {
    path_generator = d3.line()
        .x(d => scales.x(d.date))
        .y(d => scales.y(d.adj_price));

    d3.select("#series")
        .selectAll("path")
        .data(data).enter() // no longer add the array
        .append("path")
        .attrs({
            d: path_generator,
            id: d => d[0].name,
            stroke: "#969494",
            "stroke-width": 1
        })
}

function add_voronoi(flat_data, scales) {
    let delaunay = d3.Delaunay.from(flat_data, d => scales.x(d.date), d => scales.y(d.dollar_price));
    d3.select("svg").on("mousemove", (ev) => update_series(ev, flat_data, delaunay, scales))
}

function update_series(ev, flat_data, delaunay, scales) {
    let ix = delaunay.find(ev.pageX, ev.pageY);
    // con
    d3.select("#series")
        .selectAll("path")
        .attrs({
            stroke: e => e[0].name == flat_data[ix].name ? "red" : "#858585",
            "stroke-width": e => e[0].name == flat_data[ix].name ? "4px" : "1px"
        })

    d3.select(ev.target).raise()
    d3.select("#tooltip text")
        .attr("transform", `translate(${scales.x(flat_data[ix].date) + 5}, ${scales.y(flat_data[ix].adj_price) - 5})`)
        .text([flat_data[ix].name,flat_data[ix].adj_price])
}

function add_axes(scales) {
    let x_axis = d3.axisBottom()
            .scale(scales.x),
        y_axis = d3.axisLeft()
            .scale(scales.y);

    d3.select("#axes")
        .append("g")
        .attrs({
            id: "x_axis",
            transform: `translate(0,${height - margins.bottom})`
        })
        .call(x_axis);

    d3.select("#axes")
        .append("g")
        .attrs({
            id: "y_axis",
            transform: `translate(${margins.left}, 0)`
        })
        .call(y_axis)
}

function make_scales(data) {
    let y_max = 7,
        x_extent = d3.extent(data[0].map(d => d.date));
        console.log(x_extent)
    return {
        x: d3.scaleTime()
            .domain(x_extent)
            .range([margins.left, width - margins.right]),
        y: d3.scaleLinear()
            .domain([0, y_max])
            .range([height - margins.bottom, margins.top])
    }
}

let width = 1920,
    height = 1080,
    margins = {top: 100, bottom: 100, left: 50, right: 150}

d3.csv("ready_data.csv")
    .then(visualize);