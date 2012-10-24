var sys = require("sys"),
	os = require('os'),
	util = require("util"),
	mu   = require("mu2"),
	express = require("express"),
	app = express(),
	http = require("http"),
	server = http.createServer(app),
	querystring = require('querystring'),
	fs = require('fs'),
	dateFormat = require('dateformat');

mu.root = __dirname + "/templates";
server.listen(9999);
app.use("/static", express.static(__dirname + "/static"));

var graph = {};

function dateFromString(s) {
  var bits = s.replace('.000Z', '').split(/[-T:]/g);
  var d = new Date(bits[0], bits[1]-1, bits[2]);
  d.setHours(bits[3], bits[4], bits[5]);

  return d;
}

function executeSparql(sparql) {
	var data = querystring.stringify({
		'output': 'json',
		'query': sparql
	});

	var options = {
		host: 'api.artsholland.com',
		port: '80',
		path: '/sparql?apiKey=1e4263ef2d20da8eff6996381bb0d78b',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/sparql-results+json',			
			'Content-Length': data.length
		}
	};

	// Set up the request
	var request = http.request(options, function(response) {
		response.setEncoding('utf8');		
		var result = "";
		
		response.on('data', function (chunk) {
			result += chunk;
		});
		
		response.on('end', function () {
			var sparqlResult = JSON.parse(result);
			var venues = parseSPARQLResult(sparqlResult);
			graph = {venues: venues};				
		});
		
	});

	request.write(data);
	request.end();
}

function parseSPARQLResult(sparqlResult) {
	var venues = {};
	var bindings = sparqlResult.results.bindings;
	var index = 0;
	for (i in bindings) {
		if (bindings[i] != null && 'venue' in bindings[i]) {
			var vuri = bindings[i].venue.value;
			var puri = bindings[i].production.value;
			var euri = bindings[i].event.value;
			var city = bindings[i].city.value;
			if (city == "ROTTERDAM") {
				city = "Rotterdam";
			}
			
			if (venues[city] == undefined) {
				venues[city] = {};
			}
			
			if (venues[city][vuri] == undefined) {			
				venues[city][vuri] = {
					'index': venues.length,
					'uri': vuri,
					'lat': bindings[i].lat.value,
					'long': bindings[i].long.value,
					'title': bindings[i].venueTitle.value,
					'productions': {}
				};				
				index += 1;			
			} 
			
			if (venues[city][vuri].productions[puri] == undefined) {
				venues[city][vuri].productions[puri] = {
					'uri': puri,
					'title': bindings[i].productionTitle.value,	
					'events': {}				
				};
			}
			
			venues[city][vuri].productions[puri].events[euri] = {
				'uri': euri,
				'date': dateFromString(bindings[i].date.value)
			};
		
		}
	}

	return venues;
}

fs.readFile('query.sparql', 'utf-8', function (err, data) {
	if (err) {
    	console.log("FATAL An error occurred trying to read in the file: " + err);
		process.exit(-2);
	}
	// Make sure there's data before we post it
	if(data) {
		executeSparql(data);
	} else {
		console.log("No data to post");
		process.exit(-1);
	}
});

function render(res, filename) {
	mu.clearCache();
	var stream = mu.compileAndRender(filename);
	util.pump(stream, res);
}

app.get("/d3.json", function(req, res) {
	
	var d3 = {
		name: "Arts Holland",
		children: []
	};
	
	for (var city in graph.venues) {
		// Skip Dutch/Frisian cities
		if (city.indexOf("/ ") == -1) {
			var d3City = {
				name: city,
				children: []
			};
			var venues = graph.venues[city];
			for (var vuri in venues) {
				var d3Venue = {
					name: venues[vuri].title,
					children: []
				};
				var productions = venues[vuri].productions;
				for (var puri in productions) {
					
					var event;
					for (var euri in productions[puri].events) {						
					    event = productions[puri].events[euri];
						break;
					}
					
					/*date = event.date;
					
					dateString = date.getDate() + "-" + date.getMonth() + " " +
						date.getHours() + ":" +	date.getMinutes();*/
					
					var d3Production = {
						name: productions[puri].title,
						date: dateFormat(event.date, "dd-mm HH:MM")
					}
					d3Venue.children.push(d3Production);
				}
				
				d3City.children.push(d3Venue);
				
			}
			d3.children.push(d3City);
		}
	}
	
	
	res.write(JSON.stringify(d3, undefined, 2));
	res.end();
});

app.get("/graph.json", function(req, res) {	
	res.write("var graph = " + JSON.stringify(graph, undefined, 2));
	res.end();
});

app.get("/", function(req, res) {
	render(res, "index.html");
});
