import * as d3 from "d3"

export function cumulative(results, chartId, maxValue, maxYear) {
	console.log("maxValue", maxValue)
	const container = d3.select(`.rainfall #graphicContainer`)

	console.log(results)
	var data = results
	// var details = clone.sheets.template
	// var labels = clone.sheets.labels
	// var userKey = clone['sheets']['key']
	var breaks = "no"
	var context = d3.select(`.rainfall #outer-wrapper`)

	function numberFormat(num) {
        if ( num > 0 ) {
            if ( num > 1000000000 ) { return ( num / 1000000000 ) + 'bn' }
            if ( num >= 1000000 ) { return ( num / 1000000 ) + 'm' }
            if ( num >= 1000 ) { return ( num / 1000 ) + 'k' }
            if (num % 1 != 0) { return num.toFixed(2) }
            else { return num.toLocaleString() }
        }
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return [ "-" + String(( posNum / 1000000000 )) + 'bn'];
            if ( posNum > 1000000 ) return ["-" + String(( posNum / 1000000 )) + 'm'];
            if ( posNum > 1000 ) return ["-" + String(( posNum / 1000 )) + 'k'];
            else { return num.toLocaleString() }
        }
        return num;
    }

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector(`.rainfall #graphicContainer`).getBoundingClientRect().width

	var height = width*0.6

	if (windowWidth < 500) {
		height = width * 1
	}

	var margin = {top: 20, right: 105, bottom: 20, left:45}

	var dateParse = d3.timeParse("%Y-%m-%d")

	var scaleFactor = 1

	if (windowWidth < 820) {
		scaleFactor = windowWidth / 860
	}

	console.log("scaleFactor",scaleFactor)

	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

	// context.select("#chartTitle").text(details[0].title)
 //    context.select("#subTitle").text(details[0].subtitle)
 //    context.select("#sourceText").html(details[0].source)
 //    context.select("#footnote").html(details[0].footnote)
    context.select("#graphicContainer svg").remove();
    
    var chartKey = context.select("#chartKey");
	// chartKey.html("");

	var svg = context.select("#graphicContainer").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var keys = Object.keys(data[0])
	var xVar = keys[0]
	
	keys.splice(0, 1);
	
	
	// console.log(xVar, keys);

	var colors = ["#f0bb7f","#e08214","#8073ac","#4393c3","#87c1e6","rgb(204, 10, 17)"];
	var color = d3.scaleOrdinal();

	color.domain(["Extremely dry", "Very dry", "Median", "Very wet", "Extremely wet", "2022 to date"]).range(colors);
	
	console.log(color.domain())
	console.log(color("Extremely dry"))
	

	console.log(data)
	
	var x = d3.scaleTime()
		.rangeRound([0, width]);

	var y = d3.scaleLinear()
		.rangeRound([height, 0]);

	var lineGenerators = {};
	var allValues = [];

	keys.forEach(function(key,i) {

		if (breaks === "yes") {
		lineGenerators[key] = d3.line()
			.defined(function(d) {
        		return d;
    		})
			.x(function(d) { 
				return x(d[xVar]); 	
				})
			.y(function(d) { 
				return y(d[key]); 
			});
		}

		else if (breaks === "no") {
			lineGenerators[key] = d3.line()
				.x(function(d) { 
					return x(d[xVar]); 	
					})
				.y(function(d) { 
					return y(d[key]); 
				});
		}
		
		
		data.forEach(function(d) {

			if (typeof d[key] == 'string') {

				if (d[key].includes(",")) {
					if (!isNaN((d[key]).replace(/,/g, ""))) {
						d[key] = +(d[key]).replace(/,/g, "")
						allValues.push(d[key]);	
					}
					
				}
				else if (d[key] != "") {
					
					if (!isNaN(d[key])) {
						
						d[key] = +d[key]
						allValues.push(d[key]);
					}
				}

				else if (d[key] == "") {
					d[key] = null 
				}

			}
			
			else {
         		allValues.push(d[key]);
        	}
		});

	});

	data.forEach(function(d) {
		if (typeof d[xVar] == 'string') {	
			d[xVar] = d[xVar].replace("1900", "2021")
			d[xVar] = d[xVar].replace("1901", "2022")
			d[xVar] = dateParse(d[xVar])
		}	
	})

	var keyData = {}

	keys.forEach(function(key,i) {
		keyData[key] = []

		data.forEach(function(d) {
			if (d[key] != null) {
				var newData = {}
				newData[xVar] = d[xVar]
				newData[key] = d[key]
				keyData[key].push(newData)
			}
			else if (breaks == "yes") {
				keyData[key].push(null)
			}
			
		});
	})	


	// var areaData = data.filter(d => {return d[xVar] <= keyData[keys[0]][keyData[keys[0]].length - 1][xVar]})

	// console.log("areaData", areaData)

	const area1 = d3.area()
      .x((d) => x(d[xVar]))
      .y0((d) =>  y(d['Median']))
      .y1((d) => y(d['Very wet']))

    const area2 = d3.area()
      .x((d) => x(d[xVar]))
      .y0((d) =>  y(d['Very dry']))
      .y1((d) => y(d['Median']))
	  
	const area3 = d3.area()
      .x((d) => x(d[xVar]))
      .y0((d) =>  y(d['Extremely dry']))
      .y1((d) => y(d['Very dry']))   

	const area4 = d3.area()
      .x((d) => x(d[xVar]))
      .y0((d) =>  y(d['Very wet']))
      .y1((d) => y(d['Extremely wet'])) 

	// console.log("keyData",keyData)

	// labels.forEach(function(d,i) {
	// 	if (typeof d.x == 'string') {
	// 		d.x = dateParse(d.x);
	// 	}	

	// 	if (typeof d.y == 'string') {
	// 		d.y = +d.y;
	// 	}

	// 	if (typeof d.offset == 'string') {
	// 		d.offset = +d.offset;
	// 	}

	// })

	var min;

	// if (details[0]['baseline'] === 'zero') {
		min = 0;
	// }
	// else {
	// 	min = d3.min(allValues);
	// }

	allValues.push(maxValue)

	x.domain(d3.extent(data, function(d) { return d[xVar]; }));
	y.domain([0, d3.max(allValues) + 0.05 * d3.max(allValues)])

	var xAxis;
	var yAxis;

	const xTicks = isMobile ? 4 : 6

	if (isMobile) {
		xAxis = d3.axisBottom(x).ticks(xTicks)
		yAxis = d3.axisLeft(y).tickSize(-width).tickFormat(function (d) { return numberFormat(d)}).ticks(5);
	}

	else {
		xAxis = d3.axisBottom(x).ticks(xTicks)
		yAxis = d3.axisLeft(y).tickSize(-width).tickFormat(function (d) { return numberFormat(d)}).ticks(5);
	}


	svg.append("svg:defs").append("svg:marker")
		.attr("id", "arrow")
		.attr("refX", 6)
		.attr("refY", 6)
		.attr("markerWidth", 20)
		.attr("markerHeight", 20)
		.attr("markerUnits","userSpaceOnUse")
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M 0 0 12 6 0 12 3 6")
		.style("fill", "black")

	features.append("g")
		.attr("class","x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	features.append("g")
		.attr("class","y")
		.call(yAxis)
		.style("stroke-dasharray", "2 2")  

	features.select(".y .domain").remove()    

	// features.append("text")
	// 	.attr("transform", "rotate(-90)")
	// 	.attr("y", 6)
	// 	.attr("dy", "0.71em")
	// 	.attr("fill", "#767676")
	// 	.attr("text-anchor", "end")
	// 	.text("Cumulative rainfall (mm)");

	// features.append("text")
	// 	.attr("x", width)
	// 	.attr("y", height - 6)
	// 	.attr("fill", "#767676")
	// 	.attr("text-anchor", "end")
	// 	.text(details[0].xAxisLabel);	

	context.selectAll(".tick line")
		.attr("stroke", "#767676")

	context.selectAll(".tick text")
		.attr("fill", "#767676")			

	context.selectAll(".domain")
		.attr("stroke", "#767676")		

	// var areaPath = features.selectAll(".areaPath").data()

	features.append("path")
			.datum(data)
			.attr("class", "areaPath")
			.attr("fill", "#4393c3")
			.attr("opacity", 0.6)
			.attr("stroke", "none")
			.attr("d", area1)

	features.append("path")
			.datum(data)
			.attr("class", "areaPath")
			.attr("fill", "#e08214")
			.attr("opacity", 0.6)
			.attr("stroke", "none")
			.attr("d", area2)		

	features.append("path")
			.datum(data)
			.attr("class", "areaPath")
			.attr("fill", "#f0bb7f")
			.attr("opacity", 0.6)
			.attr("stroke", "none")
			.attr("d", area3)

	features.append("path")
			.datum(data)
			.attr("class", "areaPath")
			.attr("fill", "#87c1e6")
			.attr("opacity", 0.6)
			.attr("stroke", "none")
			.attr("d", area4)		

	features.append("line")
			.attr("class", "maxLine")
			.attr("x1", (d) => x(x.domain()[0]))
			.attr("y1", (d) => y(maxValue))
			.attr("x2", (d) => x(x.domain()[1]))
			.attr("y2", (d) => y(maxValue))
			.attr("stroke", "#000")
			.attr("stroke-dasharray", "2,4")
			.attr("stroke-width", 1)		
			
	features.append("text")
			.attr("x", x(x.domain()[0]))
			.attr("y", y(maxValue) - 5)
			// .attr("text-anchor", "start")
			.attr("class", "lineText")
			.attr("opacity", 1)
			.text(`Highest yearly total on record - ${maxValue.toLocaleString()}mm in ${maxYear}`)	

		// console.log(keyData[key])

	keys.forEach(function(key,i) {

		console.log(key, color(key))

		features.append("path")
			.datum(keyData[key])
			.attr("fill", "none")
			.attr("stroke", function (d) { 
					return color(key);
				})
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 3)
			.attr("d", lineGenerators[key]);


		features
          .append("circle")
          .attr("cy", (d) => {
            return y(keyData[key][keyData[key].length - 1][key])
          })
          .attr("fill", color(key))
          .attr("cx", (d) => {
            return x(keyData[key][keyData[key].length - 1][xVar])
          })
          .attr("r", 4)
          .style("opacity", 1)	

        
        features
          .append("text")
          .attr("class", "lineLabels")
          .attr("y", (d) => {
            return (
              y(keyData[key][keyData[key].length - 1][key]) +
              4 
            )
          })
          .attr("x", (d) => {
            return (
              x(keyData[key][keyData[key].length - 1][xVar]) + 5
            )
          })
          .attr("fill", "none")
          .attr("stroke", "#FFF")
          .attr("stroke-width", 5)
          .attr("opacity", 0.8)
          .text((d) => {
            return key
          })  

        features
          .append("text")
          .attr("class", "lineLabels")
          .attr("y", (d) => {
            return (
              y(keyData[key][keyData[key].length - 1][key]) +
              4 
            )
          })
          .attr("x", (d) => {
            return (
              x(keyData[key][keyData[key].length - 1][xVar]) + 5
            )
          })
          .style("opacity", 1)
          .attr("fill", color(key))
          .text((d) => {
            return key
          })

	});	
       

	context.selectAll(".annotationBox").remove()
	var footerAnnotations = context.select("#footerAnnotations")
    footerAnnotations.html("")

	//  labels.forEach( (d,i) => {

 //        var labelX1, labelX2, labelY1, labelY2,textX, textY, mobileYOffset;

 //        if (d.direction === "right") {
 //        	labelX1 = x(d.x) + (d.offset * scaleFactor)
 //        	labelX2 = x(d.x) + 6
 //        	labelY1 = y(d.y)
 //        	labelY2 = y(d.y)
 //        	textX = x(d.x) + (d.offset * scaleFactor) + margin.left + 5
 //        	textY = y(d.y) + margin.top - 40
 //        	mobileYOffset = 4
 //        }

 //        else if (d.direction === "top") {
 //        	labelX1 = x(d.x)
 //        	labelX2 = x(d.x)
 //        	labelY1 = y(d.y) - (d.offset * scaleFactor)
 //        	labelY2 = y(d.y) - 6
 //        	textX = x(d.x) + margin.left - (80 * scaleFactor)
 //        	textY = y(d.y) - (d.offset * scaleFactor) + margin.top - 40
 //        	mobileYOffset = 0
 //        }

	// 	features
	// 	      .append("line")
	// 	      .attr("class", "annotationLine")
	// 	      .attr("x1", labelX1)
	// 	      .attr("y1", labelY1)
	// 	      .attr("x2", labelX2)
	// 	      .attr("y2", labelY2)
	// 	      .style("opacity", 1)
	// 	      .attr("marker-end", "url(#arrow)")
	// 	      .attr("stroke", "#000")
		
	// 	if (isMobile) {

	// 	features.append("circle")
	// 			.attr("class", "annotationCircle")
	// 			.attr("cy", labelY1 - 4 + mobileYOffset)
	// 	        .attr("cx", labelX1)
	// 			.attr("r", 8)
	// 			.attr("fill", "#000");

	// 	features.append("text")
	// 			.attr("class", "annotationTextMobile")
	// 			.attr("y", labelY1 + mobileYOffset)
	// 			.attr("x", labelX1)
	// 			.style("text-anchor", "middle")
	// 			.style("opacity", 1)
	// 			.attr("fill", "#FFF")
	// 			.text(i + 1);
		
	// 	if (labels.length > 0 && i ==0) {
	// 		footerAnnotations.append("span")
	// 			.attr("class", "annotationFooterHeader")
	// 			.text("Notes: ");
	// 	}

	// 	footerAnnotations.append("span")
	// 		.attr("class", "annotationFooterNumber")
	// 		.text(i+1 + " - ");

	// 	if (i < labels.length -1 ) {
	// 		footerAnnotations.append("span")
	// 		.attr("class", "annotationFooterText")
	// 		.text(d.text + ", ");
	// 	}
		
	// 	else {
	// 		footerAnnotations.append("span")
	// 			.attr("class", "annotationFooterText")
	// 			.text(d.text);
	// 	}	

	

	// }

	// else {

	// container
 //        .append("div")
 //        .attr("class", "annotationBox")
 //        .style("position", "absolute")
 //        .style("width", 250 * scaleFactor + "px")
 //        .style("top", textY + "px")
 //        .style("left", textX + "px")
 //        .text(d.text)

	// }      


	// })  


	 


	// firstRun = false

}	// end init


