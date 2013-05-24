var parseSPARQLResults = function(data) {
	var results = [];
	
	// if (data) blablaba check check
	var vars = data.head.vars;		
  for (var i = 0; i < data.results.bindings.length; i++) {
		var binding = data.results.bindings[i];			
		var result = {};
    for (var j = 0; j < vars.length; j++) {
			var key = vars[j];
			var value = binding[key].value;
			result[key] = value;
		}
		results.push(result);			
	}
	return results;
};

var executeSPARQL = function(sparql, callback) {

  $.getJSON("http://api.artsholland.com/sparql.json?callback=?", {
		"query": sparql,
		"api_key": "1e4263ef2d20da8eff6996381bb0d78b"
	},
	function(data) {
		callback(parseSPARQLResults(data));
	});
};

var makeName = function(str) {
  return str.replace(/\W/g, '').toLowerCase();
};

var replaceVars = function(str, vars) {
  for (var v in vars) {
    str = str.replace("?" + v, vars[v])
  }
  return str;
};

var insertChildren = function(data, node, path, callback) {
  // var d = data;
  // for (var i = 0; i < path.length; i++) {
  //   d = data.children[0];
  // }
  
  var sparql = node.sparql;  
  var baseChild = data.children[path[0]].source[path.length - 1];
    
  executeSPARQL(sparql, function(results) {
    console.log(results);
    var newChildren = [];
    for (var i = 0; i < results.length; i++) {
      var vars = results[i];      
      var newChild = {
        "name": makeName(replaceVars(baseChild.name, vars)),
        "title": replaceVars(baseChild.title, vars), 
        "doc":  replaceVars(baseChild.doc, vars),
        "sparql":  replaceVars(baseChild.sparql, vars),
        "vars": vars
      };
      newChildren.push(newChild);      
    }
    callback(newChildren);
  });
  
};

    
//     executeSPARQL(element.sparql, function(results) {      
//       //Fill  data.options[path[0]].options met alle resulataten uit results
//       
//       for (var i = 0; i < results.length; i++) {
//          //data.options[name].options
//       }
//       
// /*      if ("children" in data) {
//         data.children.push(element);
//       } else {
//         data.children = [element];
//       }*/
//       update();
//     });