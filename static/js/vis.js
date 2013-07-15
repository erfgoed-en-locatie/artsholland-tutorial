var startVis = function() { 

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
      
  var path = [];
  
  var duration = 400;
      
  var tree = d3.layout.tree()
      //.separation(function(a, b) { return a.parent === b.parent ? 2 : 2; })
      .size([height, width]);
        
  var drawarea = d3.select("#vis").append("svg:svg")
      .attr("class","svg_container")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "scroll")
    .append("svg:g")
      .attr("class","drawarea");
      
  var vis = drawarea   
    .append("svg:g");
    
  var logo = drawarea   
    .append("svg:g")
      .attr("id","logo");        

  $("#vis").on('click', "#artsholland_logo", function(event){
     nodeClick(root.path);
  });
  
  $("#doc").on('click', "h2", function(event) {
     nodeClick(strToPath($(this).data("path")));
  });
  
  $("#doc").on('click', 'button', function(event) {    
    nodeClick(strToPath($(this).data("path")));    
  });
  
  function strToPath(str) {    
    if (typeof str === "string") {
      if (str.length > 0) {
        path = str.split(",").map(function(i){ return parseInt(i); });
      } else {
        path = [];
      }
    } else {
      path = [str];
    }    
    return path;
  }
  
  d3.xml("static/artsholland.svg", "image/svg+xml", function(xml) {    
    $('#logo').append(xml.documentElement)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  });
  
  d3.select("svg")
      .call(d3.behavior.zoom()
            .scaleExtent([1, 1])
            .on("zoom", zoom));      
  
  function zoom() {
      var scale = d3.event.scale,
          translation = d3.event.translate,
          tbound = -height * scale,
          bbound = height * scale,
          lbound = (-width + margin.right) * scale,
          rbound = (width - margin.left) * scale;
      // limit translation to thresholds
      translation = [
          Math.max(Math.min(translation[0], rbound), lbound),
          Math.max(Math.min(translation[1], bbound), tbound)
      ];
      d3.select(".drawarea")
          .attr("transform", "translate(" + translation + ")" +
                " scale(" + scale + ")");
  }
  
  // Initialize documentation:

  var stepSource = $("#step-template").html();
  var stepTemplate = Handlebars.compile(stepSource);  
  var renderStepTemplate = function(d) {
    var sparql = d.sparql ? replaceDates(d.sparql) : null;
    
    var t = {
      "path": d.path,
      "title": d.title,
      "doc": d.doc,
      "sparql": sparql,
      "jsonp_link": getJSONPLink(sparql),
      "sparql_browser_link": getSPARQLBrowserLink(sparql),
      "buttons": []
    };
    
    if (d.path.length == 0 || d.path.length < root.children[d.path[0]].source.length) {
      if (d.children && d.children.length > 0) {
        for (var i = 0; i < d.children.length; i++) {  
          // Add new button:
          t.buttons.push({
            title: d.children[i].title,
            path: d.children[i].path,
          });
        }
      }
    }
    return stepTemplate(t);
  };
  
  var doc = d3.select("#doc").append("ol");

  // Load data

  var prefixes = {}
  d3.json("prefixes.json", function(json) {
    prefixes = json;
  });
  
  var root;
  d3.json("tree.json", function(json) {
    root = json;
    root.x0 = 0;
    root.y0 = 0;
    nodeClick(root.path);
  });
   
  function update() {
    // Update tree
    updateTree(root.children[0], -1, 50);
    updateTree(root.children[1],  1, 50);
    
    // Update documentation   

    var docNodes = [root];    
    var d = root;
    for (var i = 0; i < path.length; i++) {      
      d = d.children[path[i]];  
      docNodes.push(d);
    }
        
    var li = doc.selectAll("li.docitem")
        .html(renderStepTemplate)
        .data(docNodes, function(d) { return d.path; });
                
    li.enter().append("li")
        .attr("class", "docitem")
        .html(renderStepTemplate);    
        
    li.exit().remove();
        
    $("textarea").each(function(index) {
      CodeMirror.fromTextArea(this, {
        "readOnly": true
      });    
    });
    
    
    $("#doc").animate({ scrollTop: $(document).height() }, "slow");

    
  }   
    
  function translate(x, side, offset) {
    return x / 2 * side + width / 2 + offset * side;
  }  
  
  function updateTree(startNode, side, offset) {
    // Recompute the layout and data join.
    
    var nodes = tree.nodes(startNode),
        links = tree.links(nodes);
    
    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 380; });
    
    /*var diagonal = function(d, i) {
      return "M" + (d.source.y / 2 * side + width / 2 + offset * side) + "," + d.source.x
           + "H" + (d.target.y / 2 * side  + width / 2 + offset * side) + "V" + d.target.x
           + (d.target.children ? "" : "h" + margin.right);
    };*/
      
    var sideClass = "left";
    if (side == 1) {
      sideClass = "right";
    }
      
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [translate(d.y, side, offset), d.x]; });
          
    var node = vis.selectAll(".node." + sideClass)
        .data(nodes, function(d) { return d.path; });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node " + sideClass)
        .attr("transform", function(d) { return "translate(" + translate(d.y0, side, offset) + "," + d.x0 + ")";})

    nodeEnter.append("text")
        .attr("class", "name")
        .attr("x", 8)
        .attr("y", -6)
        .style("fill-opacity", 1e-6)
        .text(function(d) { return d.title; })
        .attr("text-anchor", function(d) { return side > 0 ? "begin": "end"; })
        .on("click", function(d) {
          nodeClick(d.path);
        });
      
    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + translate(d.y, side, offset) + "," + d.x + ")"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + translate(d.parent.y, side, offset) + "," + d.parent.x + ")"; })
        .remove();

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
          
    // Update the links…
    var link = vis.selectAll(".link." + sideClass)
        .data(links, function(d) { return [d.source.path, d.target.path]; }); 
        
    link.enter().insert("path", "g")
        .attr("class", "link " + sideClass)
        .attr("d", function(d) {
          var o = {x: d.source.x0, y: d.source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: d.source.x, y: d.source.y};
          return diagonal({source: o, target: o});
        })
        .remove();
   


    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });    
                
  }
  
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  
  function expand(d, path) {    
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }    
    if (path.length > 0) {
      expand(d.children[path[0]], path.slice(1, path.length))
    }   
  }
      
  function nodeClick(_path) {    
    path = _path;
    
    // Collapse both Content and Model trees:
    collapse(root.children[0]);
    collapse(root.children[1]);
        
    // Expand root until path:
    expand(root, path);
    
    // Find node with path == _path:
    var d = root;
    for (var i = 0; i < path.length; i++) {
      d = d.children[path[i]];            
    }
    
    if (!d.children) {
      d.children = [];

      // functie: source from path
      var source;
      if (d.path.length == 1) {
        source = root.children[d.path[0]]
      } else if (d.path.length > 1) {
        if (root.children[d.path[0]].source.length >= d.path.length - 1) {
          source = root.children[d.path[0]].source[d.path.length - 2];
        }
      }
      
      var next;
      if (root.children[d.path[0]].source.length >= d.path.length) {
        next = root.children[d.path[0]].source[d.path.length - 1];
      }      
      
      if (source && next) {
        var sourceSparql = replaceDates(source.sparql);
        
        var nextSparql = replaceDates(next.sparql);
        var nextTitle = next.title;
        var nextDoc = next.doc;

        var p = d;
        while (p.parent) {
          if (p.vars) {
            sourceSparql = replaceVars(sourceSparql, p.vars);       
          }
          p = p.parent;
        } 
        
        executeSPARQL(sourceSparql, function(results) {
          
          var newChildren = [];
          for (var i = 0; i < results.length; i++) {
            var vars = results[i];
            
            var childSparql = replaceVars(nextSparql, vars);
            var childTitle = replaceVars(nextTitle, vars);
            var childDoc = replaceVars(nextDoc, vars);            

            var p = d;
            while (p.parent) {
              if (p.vars) {            
                childSparql = replaceVars(childSparql, p.vars);
                childTitle = replaceVars(childTitle, p.vars);
                childDoc = replaceVars(childDoc, p.vars);            
              }
              p = p.parent;
            }            
            
            var newChild = {
              title: replacePrefixes(childTitle, prefixes),
        			doc: childDoc,
        			sparql: childSparql,
              path: d.path.concat([i]),
              vars: vars
            };            
            newChildren.push(newChild);
          }          

          d.children = newChildren;
          update();
        });        
      }      
    } else {
      update();
    }  
  }  
}