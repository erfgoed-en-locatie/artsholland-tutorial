var xsdDateTime = function(date) {
  function pad(n) {
	 var s = n.toString();
	 return s.length < 2 ? '0'+s : s;
  };

  var yyyy = date.getFullYear();
  var mm   = pad(date.getMonth()+1);
  var dd   = pad(date.getDate());
  //var hh   = pad(date.getHours());
  //var mm2  = pad(date.getMinutes());
  //var ss   = pad(date.getSeconds());

  return yyyy + '-' + mm + '-' + dd; // +'T' +hh +':' +mm2 +':' +ss;
}


var parseSPARQLResults = function(data) {
	var results = [];
	
	// if (data) blablaba check check
	var vars = data.head.vars;  		
  for (var i = 0; i < data.results.bindings.length; i++) {
		var binding = data.results.bindings[i];			
		var result = {};
    for (var j = 0; j < vars.length; j++) {
			var key = vars[j];
      if (binding[key]) {
			  var value = binding[key].value;
			  result[key] = value;
      }
		}
		results.push(result);			
	}
	return results;
};

var executeSPARQL = function(sparql, callback) {
  //var hostname = "http://api.artsholland.com";
  var hostname = "https://api.ah.waag.org";
  $.getJSON(hostname + "/sparql.json?callback=?", {
    dataType: "jsonp",
		query: sparql,
		api_key: "1e4263ef2d20da8eff6996381bb0d78b"
	},
	function(data) {
		callback(parseSPARQLResults(data));
	});
};

var makeName = function(str) {
  return str.replace(/\W/g, '').toLowerCase();
};

var replaceDates = function(sparql) {
  var dateStart = new Date();
  var dateEnd = new Date(+new Date + 12096e5);  
  return sparql
    .replace("??date_start", xsdDateTime(dateStart))
    .replace("??date_end", xsdDateTime(dateEnd));
}

var getVar = function(vari, obj) {
  if (vari && vari.charAt(0) == '?' && vari.charAt(1) == '?') {
    if (obj[vari.substring(2, vari.length)]) {
      return obj[vari.substring(2, vari.length)]
    }
  }  
  return null;
};

var replaceVars = function(str, vars) {
  for (var v in vars) {
    str = str.replace("??" + v, vars[v])
  }
  return str;
};

var replacePrefixes = function(str, prefixes) {
  for (var prefix in prefixes) {
    var uri = prefixes[prefix];
    if (str.indexOf(uri) == 0) {
      return str.replace(uri, prefix + ":");
    }
  }
  return str;
};

// var insertChildren = function(data, node, path, callback) {
//   // var d = data;
//   // for (var i = 0; i < path.length; i++) {
//   //   d = data.children[0];
//   // }
//   
//   var sparql = node.sparql;  
//   var baseChild = data.children[path[0]].source[path.length - 1];
//     
//   executeSPARQL(replaceDates(sparql), function(results) {
//     console.log(results);
//     var newChildren = [];
//     for (var i = 0; i < results.length; i++) {
//       var vars = results[i];      
//       var newChild = {
//         "name": makeName(replaceVars(baseChild.name, vars)),
//         "title": replaceVars(baseChild.title, vars), 
//         "doc":  replaceVars(baseChild.doc, vars),
//         "sparql":  replaceDates(replaceVars(baseChild.sparql, vars)),
//         "vars": vars,
//         "children": []
//       };
//       newChildren.push(newChild);      
//     }
//     callback(newChildren);
//   });
//   
// };

    
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