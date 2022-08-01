import * as d3 from "d3"

export function radial(results, type, chartId, animationSpeed) {

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	console.log(`.${type} #graphicContainer`)

	var width = document.querySelector(`.${type} #graphicContainer`).getBoundingClientRect().width
	
	if (width > 620) {
		width = 620
	}
	var height = width			
	var margin = {top: 20, right: 20, bottom: 20, left: 20}

	var context = d3.select(`.${type} #outer-wrapper`)

	width = width,
    height = width;

  var chartKey = context.select("#chartKey");
	var dateParse = d3.timeParse("%Y-%m-%d")
	
	results.forEach(d => {
		if (typeof d.date == 'string') {
			d.date = dateParse(d.date)
		}
		
		d.year = +d.year
		if (type == 'river') {
			d.rainfall = +d.Max
		}

		else {
			d.rainfall = +d.rainfall
		}
		
		
	})


	var max = d3.max(results, d => d.rainfall)	
	results.sort((a,b) => d3.ascending(a.date, b.date))

	var startYear = results[0].year

	var data = d3.group(results, d => d.year)
	// chartKey.html("");

	context.select("#graphicContainer svg").remove();

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
		.attr("fill","#d61d00")
		.text(startYear)    

	var units = (type === 'river') ? "m" : "mm" 	

	var replay = svg.append("rect")
		.attr("x", -25)
		.attr("y", 20)
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("width", 50)
		.attr("height", 25)
		.attr("opacity", 0)
		.attr("fill", "grey")
		.style("cursor", "pointer")
		.attr("id", "replay")
		.attr("class", "replay")
		.on("click", animationRestart)
	
	svg.append("text")
		.attr("x", 0)
		.attr("y", 35)
		.attr("text-anchor", "middle")
		.attr("fill", "#FFF")
		.style("pointer-events", "none")
		.attr("opacity", 0)
		.attr("class", "replay")
		.text("replay")

	context.selectAll(".replay").attr("opacity",0)	

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
      .data(y.ticks(7).reverse())
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
            .text((x, i) => `${x.toFixed(0)}${i ? "" : units}`)
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

	function drawLine() {

		if (currentYear != 2022) {
			lines.append("path")
		  		.datum(data.get(currentYear))
			      .attr("fill", "none")
			      .attr("stroke", "red")
			      .attr("stroke-width", 2)
			      .attr("class", "yearLine")
			      .attr("opacity", 1)
			      .attr("data-year", currentYear)
			      .attr("d", line)
			      .transition()
						.duration(800)
						.attr("stroke", "#c6dbef")
						.attr("opacity", 0.7)
		}
		
		else {
				lines.append("path")
		  		.datum(data.get(2022))
			      .attr("fill", "none")
			      .attr("stroke", "red")
			      .attr("class", "yearLine")
			      .attr("id", "currentYear")
			      .attr("stroke-width", 2)
			      .attr("d", line)
		}


	}

  function fadeIn(selection) {
    	console.log(selection)
    
 
 }

   function fadeOut(selection) {
    	console.log(selection)
    	context.selectAll(".yearLine").transition("fade1", 500).attr("stroke", "#c6dbef")
    	selection.transition("fade2", 500).attr("stroke", "red")
 
 }
	
var interval = d3.interval(animate, animationSpeed);
  	
// var animationSpeed = 200
var currentYear = startYear

// var counter = context.select("#counter")
var limit = 2022

function animate(t) {

if (currentYear >= limit) {
	console.log("stop")
	
	context.selectAll(".replay").transition().attr("opacity",1)

	context.selectAll(".yearLine")
		.on('mouseover', function() {
					console.log(d3.select(this).data()[0][0].year)
		      		context.selectAll(".yearLine").attr("stroke", "#c6dbef").attr("opacity", 0.7)
    				d3.select(this).attr("stroke", "red").attr("opacity", 1).raise()
    				
    				counter.text(d3.select(this).data()[0][0].year)

		      })
	  	.on('mouseout', function() {
	  		d3.select(this).attr("stroke", "#c6dbef").attr("opacity", 0.7)
	  		context.select("#currentYear").attr("stroke", "red").attr("opacity", 1).raise()
	  		counter.text(2022)
	  	})

	// counter.text(2021)
	interval.stop()	   
}
	console.log("tick")
	drawLine()
	counter.text(currentYear)
	currentYear++
}

function animationRestart() {
	console.log("restarting", startYear)
	context.selectAll(".replay").attr("opacity",0)
	currentYear = startYear
	interval.stop()

	// setTimeout(function() {
	// 	context.selectAll(".yearLine").remove()

	// 	interval = d3.interval(animate, animationSpeed)

	// }, 2000)
	context.selectAll(".yearLine").remove()

	interval = d3.interval(animate, animationSpeed)

}	



  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);    

} // end init
