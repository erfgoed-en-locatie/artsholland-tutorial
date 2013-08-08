#!/usr/local/bin/node

var sys = require("sys"),
	os = require('os'),
	util = require("util"),
	mu   = require("mu2"),
	express = require("express"),
	md = require("node-markdown").Markdown,
	app = express(),
	http = require("http"),
	async = require("async"),
	server = http.createServer(app),
	fs = require('fs'),
	dateFormat = require('dateformat'),
	traverse = require('traverse'),
	sparql = require('./sparql'),
	tree = require('./tree'),
	prefixes = require('./prefixes');

mu.root = __dirname + "/templates";
server.listen(12345);
app.use("/static", express.static(__dirname + "/static"));

var graph = {};
var treeBuilt = false; 

function dateFromString(s) {
  var bits = s.replace('.000Z', '').split(/[-T:]/g);
  var d = new Date(bits[0], bits[1]-1, bits[2]);
  d.setHours(bits[3], bits[4], bits[5]);
  return d;
}

function render(res, filename) {
	mu.clearCache();
	var stream = mu.compileAndRender(filename);
	util.pump(stream, res);
}

function index(req, res) {
	try {
		fs.readFile('./templates/index.html', function(error, content) {
			res.writeHead(200, {'Content-Type' : 'text/html'});
			res.end(content, 'utf-8');        
		});
	} catch(err){
		res.writeHead(500, {'Content-Type' : 'text/plain'});
		res.end('Internal Server Error');
	}	
}

app.get("/", function(req, res) {
  index(req, res);
});

app.get("/index.html", function(req, res) {
  index(req, res);
});

app.get("/prefixes.json", function(req, res) {
	res.writeHead(200, {'Content-Type' : 'application/json'});	
	res.write(JSON.stringify(prefixes, undefined, 2));
	res.end();
});

app.get("/tree.json", function(req, res) {
  if (!treeBuilt) {
    tree = traverse(tree).forEach(function (x) {
      if (typeof x === "string" && x.indexOf("file:") != -1) {
  			var u = this;
  			var filename = x.replace("file:", "");						
  			if (x.indexOf(".sparql") != -1) {
  				var useMarkdown = false;
  				filename = "sparql/" + filename;
  			} else if (x.indexOf(".markdown") != -1) {
  				var useMarkdown = true;
  				filename = "doc/" + filename;
  			}			
  			var content = fs.readFileSync(filename, 'utf8');			
  			if (useMarkdown) {
  				this.update(md(content, true));
  			} else {
  				this.update(content);						
  			}			
  		}
  	});
    treeBuilt = true;
  }
	res.writeHead(200, {'Content-Type' : 'application/json'});
	res.write(JSON.stringify(tree, undefined, 2));
	res.end();	
});

function flatten(obj, into	) {
  into = into || {};
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var prop = obj[k];
      if (prop && typeof prop === "object" &&
        !(prop instanceof Date || prop instanceof RegExp)) {
            flatten(prop, into, k + "_");
        } else {
          into[k] = prop;
        }
      }
  }
  return into;
}
