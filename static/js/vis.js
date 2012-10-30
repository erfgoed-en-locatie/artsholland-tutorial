$(document).ready(function() {
	var title, doc;
	var sections = {};
	

	
	var stepSource = $("#step-template").html();
	var stepTemplate = Handlebars.compile(stepSource);
	
	$.getJSON('steps.json', function(data) {
		// TODO: title er uit? Kan ook gewoon in markdown natuurlijk.
		title = data.title;
		doc = data.doc;
		sections = data.sections;
		addSectionsStep(title, doc, sections);
		
	});
	
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
		var options = ["Content", "Model"];
		addStep("sections", title, doc, null, options);		
	};
	
	var addSPARQLStep = function(id, title, doc, sparql) {
		// var options = executeSPARQL(sparql);
		var options = ["Amsterdam", "Den Haag", "Rotterdam"];
		addStep(id, title, doc, sparql, options);
	};
	
	$("button").click(function() {
		var id = $(this).attr("data-section");
		var section = sections[id];		
		addSPARQLStep("vis", section.title, section.doc, section.sparql);
	});
});
