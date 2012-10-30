var http = require("http"),
	querystring = require('querystring');

exports.execute = function execute(sparql, callback) {
	//var self = this; // Use a closure to preserve `this`
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
	
	var request = http.request(options, function(response) {
		response.setEncoding('utf8');		
		var result = "";
		
		response.on('data', function (chunk) {
			result += chunk;
		});
		
		response.on('end', function () {
			callback(JSON.parse(result));
		});		
	});

	request.write(data);
	request.end();
};



