import * as d3 from "d3"
import { cumulative } from "shared/js/cumulative";

var selected = 'observatory-hill'
var currentResults
var rainfall = [
	{"id":"observatory-hill", "text":"Observatory Hill, Sydney", "notes":"Combines BoM stations 66214 and 066062", "years":"1859 to 2021", "maxValue":2194, "maxYear":"1950"},
	{"id":"parramatta", "text":"Parramatta, Sydney", "notes":"Rainfall data from 066046, 067032, 066124,", "years":"1909 to 2021", "maxValue":1856, "maxYear":"1950"}
	]

Promise.all([
	d3.csv(`<%= path %>/${selected}-year.csv`)
	])
	.then((results) =>  {
		cumulative(results[0], selected, rainfall[0].maxValue, rainfall[0].maxYear)
		currentResults = results[0]
		d3.select(".rainfall #loadingContainer").style("display","none")
	});

var to=null
var lastWidth = document.querySelector(`.rainfall #graphicContainer`).getBoundingClientRect()

window.addEventListener('resize', function() {
	var thisWidth = document.querySelector(`.rainfall #graphicContainer`).getBoundingClientRect()
	if (lastWidth != thisWidth) {
		var currentRiver = rainfall.find(d => d.id == selected)

		window.clearTimeout(to);
		to = window.setTimeout(function() {
			    cumulative(currentResults, selected, currentRiver.maxValue, currentRiver.maxYear)
			}, 100)
	}

})	




var selector = d3.select(".rainfall #rainSelector")

rainfall.forEach(function (d) {
		console.log("blah")
		selector.append("option")
			.attr("value",d.id)
			.text(d.text)	
})


selector.on("change", function() {
		d3.select(".rainfall #loadingContainer").style("display","block")
		selected = d3.select(this).property('value')
		var currentRiver = rainfall.find(d => d.id == selected)
		
		d3.select(".rainfall #yearsNote").text(currentRiver.years)
		d3.select(".rainfall #footnote").text(currentRiver.notes)

		console.log(selected)

		Promise.all([
		d3.csv(`<%= path %>/${selected}-year.csv`)
		])
		.then((results) =>  {
			d3.select(".rainfall #loadingContainer").style("display","none")
			cumulative(results[0], selected, currentRiver.maxValue, currentRiver.maxYear)
			currentResults = results[0]
		});

});