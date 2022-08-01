import * as d3 from "d3"

function init(results) {

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
	if (width > 620) {
		width = 620
	}
	var height = width			
	var margin = {top: 20, right: 20, bottom: 20, left: 20}

	var context = d3.select("#rainGraph1")

	width = width,
    height = width;

    var chartKey = context.select("#chartKey");
	var dateParse = d3.timeParse("%Y-%m-%d")
	
	results.forEach(d => {
		d.date = dateParse(d.date)
		d.year = +d.year
		d.rainfall = +d.Max
		// d.rainfall = +d.rainfall
	})


	var max = d3.max(results, d => d.rainfall)	
	results.sort((a,b) => d3.ascending(a.date, b.date))

	var startYear = results[0].year

	var data = d3.group(results, d => d.year)
	console.log(data.get(2021))
	chartKey.html("");

	var svg = context.select("#graphicContainer").append("svg")
				.attr("viewBox", [-width / 2, -height / 2, width, height])
				.attr("width", width )
				.attr("height", height )
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var lines = svg.append("g")

	var innerRadius = width * 0.15
	var outerRadius = width / 2 - margin.left

	var x = d3.scaleUtc()
	    .domain([Date.UTC(1900, 0, 1), Date.UTC(1901, 0, 1) - 1])
	    .range([0, 2 * Math.PI])
	    
	var y = d3.scaleLinear()
	    .domain([0,max])
	    .range([innerRadius, outerRadius])

	var counter = svg.append("text")
		.attr("x", 0)
		.attr("y", 0)
		.attr("id", "counter")
		.attr("text-anchor", "middle")
		.text(startYear)    

	var xAxis = g => g
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .call(g => g.selectAll("g")
      .data(x.ticks())
      .join("g")
        .each((d, i) => d.id = {id: "month" + i, href:  new URL(`#${"month" + i}`, location)} )
        .call(g => g.append("path")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)
            .attr("d", d => `
              M${d3.pointRadial(x(d), innerRadius)}
              L${d3.pointRadial(x(d), outerRadius)}
            `))
        .call(g => g.append("path")
            .attr("id", d => d.id.id)
            .datum(d => [d, d3.utcMonth.offset(d, 1)])
            .attr("fill", "none")
            .attr("d", ([a, b]) => `
              M${d3.pointRadial(x(a), outerRadius)}
              A${outerRadius},${outerRadius} 0,0,1 ${d3.pointRadial(x(b), outerRadius)}
            `))
        .call(g => g.append("text")
          .append("textPath")
            .attr("startOffset", 6)
            .attr("xlink:href", d =>  {
            	return d.id.href
            })
            .text(d3.utcFormat("%B"))))
            
    var yAxis = g => g
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .call(g => g.selectAll("g")
      .data(y.ticks(8).reverse())
      .join("g")
        .attr("fill", "none")
        .call(g => g.append("circle")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.2)
            .attr("r", y))
        .call(g => g.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text((x, i) => `${x.toFixed(0)}${i ? "" : "mm"}`)
          .clone(true)
            .attr("y", d => y(d))
          .selectAll(function() { return [this, this.previousSibling]; })
          .clone(true)
            .attr("fill", "currentColor")
            .attr("stroke", "none")))
            
    var line = d3.lineRadial()
	    .curve(d3.curveLinear)
	    .angle(d => { 
	    	return x(d.date)
	    })                   
    	.radius(d => { 
    		return y(d.rainfall)
    	})

  	var animationSpeed = 200
	var currentYear = startYear

	// var counter = context.select("#counter")
	var limit = 2021

  	function animate(t) {

		if (currentYear >= limit) {
			console.log("stop")
			// counter.text(2021)
			interval.stop()	   
		}
			drawLine()
			counter.text(currentYear)
			currentYear++
	}

	function animationRestart() {
		console.log("pause")
		
		monthText.text("Replaying")

		var t = d3.timer(function(elapsed) {
			monthText.text("Paused")
		  	yearText.text(10 - Math.round(elapsed/1000))
		  	// console.log(elapsed)
		  	if (elapsed > 10000)

		  	{
		  		t.stop()
		  		currentDate = moment(startDateStr, 'YYYY-MM-DD');
				interval.restart(animate, animationSpeed)
		  	} 
		}, 1000);
	}	

	function drawLine() {


		if (currentYear != 2021) {
			lines.append("path")
	  		.datum(data.get(currentYear))
		      .attr("fill", "none")
		      .attr("stroke", "red")
		      .attr("stroke-width", 2)
		      .attr("opacity", 1)
		      .attr("d", line)
		      .transition()
					.duration(300)
					.attr("stroke", "lightgrey")
					.attr("opacity", 0.5)
		}
		
		else {
				lines.append("path")
		  		.datum(data.get(2021))
			      .attr("fill", "none")
			      .attr("stroke", "red")
			      .attr("stroke-width", 2)
			      .attr("d", line)
		}


	}
	
	var interval = d3.interval(animate, animationSpeed);
  	
  	

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);    



} // end init

Promise.all([
	d3.csv(`<%= path %>/penrith.csv`)
	])
	.then((results) =>  {
		init(results[0])
		// var to=null
		// var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
		// window.addEventListener('resize', function() {
		// 	var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
		// 	if (lastWidth != thisWidth) {
		// 		window.clearTimeout(to);
		// 		to = window.setTimeout(function() {
		// 			    init(results[0])
		// 			}, 100)
		// 	}
		
		// })

	});