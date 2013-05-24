$(document).ready(function() {
	var stepSource = $("#step-template").html();
	var stepTemplate = Handlebars.compile(stepSource);
	
	// TODO: pak nu + 'n week:
	//dateFrom = "2012-12-01"
	//dateTo = "2012-12-08"
	var width = 400;
	var height = 600;
	
	var tree = d3.layout.tree()
		.size([width, height])
		.children(function(d) {
			
			if ("children" in d && d.children.length !== 0) {
				return d.children;
			} else if ("results" in d && d.results.length !== 0) {
				var options = d.results;
			} else { // Grijp uit source
				var options = d.source;
			}
			var buttons = [];
			for (var i in options) {
				var title = options[i][d.vars.display];
				var button = {
					"name": options[i].name,
					"title": title
				}
				buttons.push(button);
			}
			return buttons;
			
			//return d.children;
		});
	
	var calcLeft = function(d) {
		var l = d.y;
		if (!d.isRight) {
		 	l = d.y-halfWidth;
			l = halfWidth - l;
		}
		return {x : d.x, y : l};
	};
		
	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y / 4, d.x / 4]; });
	
	var elbow = function (d, i) {
		var source = calcLeft(d.source);
		var target = calcLeft(d.target);
		var hy = (target.y-source.y)/2;
		if (d.isRight) hy = -hy;
		return "M" + source.y + "," + source.x
			+ "H" + (source.y+hy)
			+ "V" + target.x + "H" + target.y;
	    };
	
	var connector = elbow;
	
	var data = {};
	
	var vis = d3.select("#vis").append("svg:svg")
		.attr("width", width)
		.attr("height", height)
		.append("g");
	
	var parseSPARQLResults = function(data) {
		var results = [];
		
		// if (data) blablaba check check
	
		var vars = data.head.vars;		
		for (var i in data.results.bindings) {
			var binding = data.results.bindings[i];			
			var result = {};
			for (var j in vars) {
				var key = vars[j];
				var value = binding[key].value;
				result[key] = value;
			}
			results.push(result);			
		}
		return results;
	};
	
	var executeSPARQL = function(sparql, callback) {		
		$.getJSON("http://api.artsholland.com/sparql.json?callback=?",
		{
			"query": sparql,
			"apiKey": "1e4263ef2d20da8eff6996381bb0d78b"
		},
		function(data) {
			callback(parseSPARQLResults(data));
		});
	};
	
	d3.json("tree.json", function(json) {
	    data = json;
		update();
	});
	
	var update = function() {
		var nodes = tree.nodes(data);
		var links = tree.links(nodes);
	
		var node = vis.selectAll("g.node")
			.data(nodes)
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(d) { 
				return "translate(" + d.y / 4 + "," + d.x / 4 + ")"; 
			});

		node.append("circle")
			.attr("r", 4.5);

		node.append("text")
			.attr("dx", function(d) { return d.children ? -8 : 8; })
			.attr("dy", 3)
			.text(function(d) { return d.title; });
		
		var link = vis.selectAll(".link")
			.data(links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", diagonal);


		d3.select("#doc ol")
			.selectAll("li")
			.data(nodes)

			.enter()
			.append("li")
	    	.html(function(d) {		
				if ("children" in d && d.children.length !== 0) {
					var options = d.children;
				} else if ("results" in d && d.results.length !== 0) {
					var options = d.results;
				} else { // Grijp uit source
					var options = d.source;
				}
				d.buttons = [];
				for (var i in options) {
					var title = options[i][d.vars.display];
					var button = {
						"name": options[i].name,
						"title": title
					}
					d.buttons.push(button);
				}
				var html = stepTemplate(d);
				return html;
			});

		$("textarea:visible").each(function(index) {
			CodeMirror.fromTextArea(this, {
				//"readOnly": true
			});		
		});
	};

	$("body").on("click", "button", function() {		
		var name = $(this).attr("data-name");
		var element = {};
		var key;
		for (var i in data.source) {
			if (name === data.source[i].name) {
				element = data.source[i].children[0];
				key = i;
			}
		}
		//https://github.com/mbostock/d3/wiki/Selections#wiki-data
		
		executeSPARQL(element.sparql, function(results) {
			element.results = results;
			
			if ("children" in data) {
				data.children.push(element);
			} else {
				data.children = [element];
			}
			update();
		});
		
	});
});
