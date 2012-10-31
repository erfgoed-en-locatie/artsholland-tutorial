$(document).ready(function() {
	var title, doc;
	var sections = {};
		
	var stepSource = $("#step-template").html();
	var stepTemplate = Handlebars.compile(stepSource);
	
	// TODO: pak nu + 'n week:
	//dateFrom = "2012-12-01"
	//dateTo = "2012-12-08"
	
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
	    
		var tree = d3.layout.tree();	
		var nodes = tree.nodes(json);

		var node = d3.select("#doc ol")
			.selectAll("li")
			.data(nodes)
			.enter()
			.append("li")
	    	.html(function(d) {		
				if (d.children.length !== 0) {					
					var options = [];
					for (var i in d.children) {
						var option = {
							"title": d.children[i].title
						}
						options.push(option);
						d.options = options;
					}					
				} else {
					var li = this;
					executeSPARQL(d.sparql, function(results) {
					
					//TODO: use http://bl.ocks.org/999346
						
						li.select("options")
							.selectAll("button")
							.data(results)
							.enter()
							.append("button")
							.text(function(d) {
								if (d.city) {
									return d.city;
								} else {
									return d.class;
								}
							});
						
						//<button>{{title}}</button>

							/*var options = [
								{
									"section": "0",
									"title": title,
									"type": "step",
									"index": 9
								}
							];				
							d.options = options;	*/

					});								
				}
				var html = stepTemplate(d);
				return html;
			});

		$("textarea").each(function(index) {
			var myCodeMirror = CodeMirror.fromTextArea(this, {
				"readOnly": true
			});		
		});

	});
	
	
	
	/*$.getJSON('tree.json', function(data) {
	
		title = data.title;
		doc = data.doc;
		sections = data.sections;
		addSectionsStep(title, doc, sections);		
	});*/
	
	var addStep = function(id, title, doc, sparql, options) {
		var data = {
			"id": id,
			"title": title,
			"doc": doc,
			"sparql": sparql,
			"options": options
		};		
		var html = stepTemplate(data);
		$('#steps').append(html);
	};
	
	var addSectionsStep = function(title, doc, sections) {		
		var options = [];		
		for (var id in sections) {
		  if (sections.hasOwnProperty(id)) {
			var option = {};
			var title = sections[id].title;
			
			option.section = id;
			option.title = title;
			option.type = "section";
			options.push(option);
		  }
		}		
		addStep("sections", title, doc, null, options);		
	};
	
	var addSPARQLStep = function(id, title, doc, sparql) {
		// var options = executeSPARQL(sparql);
		var options = [
			{
				"section": id,
				"title": title,
				"type": "step",
				"index": 9
			}
		];
		addStep(id, title, doc, sparql, options);
	};
	
	$("body").on("click", "button", function() {
		
		/*var myCodeMirror = CodeMirror(document.body, {
		  value: "function myScript(){return 100;}\n",
		  mode:  "sparql"
		});*/
		
		/*
		var type = $(this).attr("data-step-type");
		var section = $(this).attr("data-step-section");
		var index = $(this).attr("data-step-index");
		
		if (type === "section") {
			var steps = sections[section].steps;
			var title = steps[0].title;
			var doc = steps[0].doc;
			var sparql = steps[0].sparql;
		} else { //if (type === "step") {
		
		}		

		addSPARQLStep("vis", title, doc, sparql);
		*/
	});
});
