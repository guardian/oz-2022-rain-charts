import { radial } from "shared/js/radial";
import * as d3 from "d3"

var selected = 'north-richmond'
var animationSpeed = 500

Promise.all([
	d3.csv(`<%= path %>/${selected}.csv`)
	])
	.then((results) =>  {
		radial(results[0], 'river', selected, animationSpeed)
		d3.select(".river #loadingContainer").style("display","none")
	});

var to=null
var lastWidth = document.querySelector(".river #graphicContainer").getBoundingClientRect()

// window.addEventListener('resize', function() {
// 		var thisWidth = document.querySelector(".river #graphicContainer").getBoundingClientRect()
// 		if (lastWidth != thisWidth) {
// 			window.clearTimeout(to);
// 			to = window.setTimeout(function() {
// 				    radial(results[0], 'river', selected, animationSpeed)
// 				}, 100)
// 		}
	
// 	})

var rivers = [
	{"id":"north-richmond", "text":"Hawkesbury, Richmond", "title":"Hawkesbury River at North Richmond: 2021 flood height vs historic heights", "subtitle":"Yep", "animationSpeed":300},
	{"id":"penrith", "text":"Nepean, Penrith", "title":"Nepean River at Penrith: 2021 flood height vs historic heights", "subtitle":"Yep", "animationSpeed":300},
	{"id":"shoalhaven", "text":"Shoalhaven, Buangla", "title":"Shoalhaven River at Buangla: 2021 flood height vs historic heights", "subtitle":"Yep", "animationSpeed":300},

]
var selector = d3.select(".river #riverSelector")

rivers.forEach(function (d) {
		selector.append("option")
			.attr("value",d.id)
			.text(d.text)	
})


selector.on("change", function() {
		d3.select(".river #loadingContainer").style("display","block")
		selected = d3.select(this).property('value')
		var currentRiver = rivers.find(d => d.id == selected)
		animationSpeed = currentRiver['animationSpeed']
		
		// d3.select(".river #chartTitle").text(currentRiver.title)
		// d3.select(".river #subTitle").text(currentRiver.subtitle)

		console.log(selected, animationSpeed)

		Promise.all([
		d3.csv(`<%= path %>/${selected}.csv`)
		])
		.then((results) =>  {
			d3.select(".river #loadingContainer").style("display","none")
			radial(results[0], 'river', selected, animationSpeed)
		});

});