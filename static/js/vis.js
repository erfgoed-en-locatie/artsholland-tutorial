function Vis() { 

  // TODO: also implement?? http://bl.ocks.org/mbostock/4063550
  
  var width = 1400,
      height = 800,
      offset = {x: 0, y: 0}; // Offset of center. Used to move tree to 'active' nodes when clicked.
      
  var path = [];
  
  var duration = 400;
  
  var subTreeX = 75;
  var linkSpacing = 20;
        
  var tree = d3.layout.tree()
      .size([height, width]);
        
  var svg = d3.select("#vis").append("svg:svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("overflow", "scroll")
    
  svg.append("defs").append("marker")
      .attr("id", "circle-marker")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("viewBox", "-5 -5 10 10")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("circle")    
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5);

  var center = svg.append("svg:g")
      .attr("id","center")
      .attr("transform", "translate(" + $("#vis").width() / 2 + "," + $("#vis").height() / 2  + ")");
  
  var drawarea = center.append("svg:g")
      .attr("id","drawarea");
          
  drawarea.append("svg:g")
      .attr("class","left")
      .attr("transform", "translate(-" + subTreeX + ",0)");
      
  drawarea.append("svg:g")
      .attr("class","right")
      .attr("transform", "translate(" + subTreeX + ",0)");
    
  // Draw two static links
  
  drawarea.append("line")
      .attr("class", "link")
      .attr("marker-start", "url(#circle-marker)")
      .attr("marker-end", "url(#circle-marker)")
      .attr("x1", -subTreeX + linkSpacing - 8)
      .attr("y1", 0)
      .attr("x2", -18 - linkSpacing + 7) // width of logo + linkSpacing
      .attr("y2", 0);

  drawarea.append("line")
      .attr("class", "link")
      .attr("marker-start", "url(#circle-marker)")
      .attr("marker-end", "url(#circle-marker)")
      .attr("x1", subTreeX - linkSpacing + 8)
      .attr("y1", 0)
      .attr("x2", 18 + linkSpacing - 7) // width of logo + linkSpacing
      .attr("y2", 0);  
  
  var logo = drawarea.append("svg:g")
      .attr("class","logo clickable")      
    .append("svg:use")
      .attr("xlink:href", "#logo")
      .attr("transform", "translate(-17,-18)")
    .on("click", function(d) {          
     nodeClick(root, root.path);
    });
        
  $("#doc").on('click', "h2 span", function(event) {
     var path = strToPath($(this).data("path"));
     nodeClick(pathToNode(path), path);
  });
  
  $("#doc").on('click', 'table tr', function(event) {    
    var path = strToPath($(this).data("path"));
    nodeClick(pathToNode(path), path);
  });
      
  function pathToNode(path) {
    var d = root;
    for (var i = 0; i < path.length; i++) {      
      d = d.children[path[i]];      
    }
    return d;
  }
  
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
  
  d3.select("svg")
      .call(d3.behavior.zoom()
          .scaleExtent([1, 1])
          .on("zoom", zoom));      
  
  // TODO: also make classes from other functions and sparql.js 
  this.resize = function() {
    $("#center")
        .attr("transform", "translate(" + ($("#vis").width() / 2 + offset.x) + "," + ($("#vis").height() / 2 + offset.y)  + ")");
  }
  
  function zoom() {
    // TODO: use current tree size when calculating bounds
    var scale = d3.event.scale,
        translation = d3.event.translate,
        tbound = -height * scale,
        bbound = height * scale,
        lbound = (-width) * scale,
        rbound = (width) * scale;
    // limit translation to thresholds
    translation = [
      Math.max(Math.min(translation[0], rbound), lbound),
      Math.max(Math.min(translation[1], bbound), tbound)
    ];
    d3.select("#drawarea")
        .attr("transform", "translate(" + translation + ")" + " scale(" + scale + ")");
  }
  
  // Initialize documentation:

  var stepSource = $("#step-template").html();
  var stepTemplate = Handlebars.compile(stepSource);  
  var renderStepTemplate = function(d) {
    var sparql = d.sparql ? replaceDates(d.sparql) : null;
    
    var useButtons = (d.path.length == 0 || d.path.length < root.children[d.path[0]].source.length);
    
    var t = {
      "path": d.path,
      "title": d.longtitle,      
      "doc": d.doc,
      "sparql": sparql,
      "json_link": getJSONLink(sparql),
      "sparql_browser_link": getSPARQLBrowserLink(sparql),
      "use_buttons": useButtons,
      "results": []
    };    

    if (d.children && d.children.length > 0) {
      for (var i = 0; i < d.children.length; i++) {  
        // Add new button:
        t.results.push({
          title: d.children[i].title,
          subtitle: d.children[i].subtitle,
          path: d.children[i].path,
        });
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
    nodeClick(root, root.path);
  });
   
  function update(clickedNode) {

    var clickedNode0, clickedNote1;    
    if (path[0] == 0) {
      clickedNode1 = root.children[1];
      // clickedNode should never be root
      if (clickedNode.path == []) {
        clickedNode0 = root.children[0];
      } else {
        clickedNode0 = clickedNode;
      }      
    } else { // path[0] == 1
      clickedNode0 = root.children[0];
      // clickedNode should never be root
      if (clickedNode.path == []) {
        clickedNode1 = root.children[1];
      } else {
        clickedNode1 = clickedNode;
      }
    }
    
    // Update tree
    updateTree(root.children[0], clickedNode0, -1);
    updateTree(root.children[1], clickedNode1,  1);    
    
    // Update documentation   
    
    // Get last scroll position
    var scrollTop = $("#doc").scrollTop();

    var docNodes = [root];    
   
    var d = root;
    for (var i = 0; i < path.length; i++) {      
      d = d.children[path[i]];  
      docNodes.push(d);
    }
        
    var li = doc.selectAll("li.docitem")        
        .data(docNodes, function(d) { return d.path; });
                
    li.enter().append("li")
        .attr("class", "docitem")
        .html(renderStepTemplate);
        
    li.html(renderStepTemplate);
        
    li.exit().remove();
        
    $("textarea").each(function(index) {
      CodeMirror.fromTextArea(this, {
        "readOnly": true
      });    
    });
    
    $("#doc").scrollTop(scrollTop);
    $("#doc").animate({ scrollTop: $("#doc ol").height() - $("#doc ol li.docitem:last-child").height() }, "slow");
    
  }   
    
  function translateX(x, side) {
    return x / 2 * side;
  }

  function translateY(y) {
    return y - height / 2;
  }
  
  function getXYFromTranslate(element){
    var split = element.attr("transform").split(" ");
    return split;
    var x = ~~split[0].split("(")[1];
    var y = ~~split[1].split(")")[0];
    return [x, y];
  } 
  
  function updateTree(rootNode, clickedNode, side) {
    var sideClass = "left";
    if (side == 1) {
      sideClass = "right";
    }
      
    // Recompute the layout and data join.
    
    var nodes = tree.nodes(rootNode),
        links = tree.links(nodes);    

    var maxNodeWidthAtDepths = {};
    nodes.forEach(function(d) { 
      var maxNodeWidths = 0;
      for (var depth = 0; depth < d.depth; depth++) {          
        if(!(depth in maxNodeWidthAtDepths)) {        
          var maxNodeWidth = 0;
          $("g." + sideClass + " .node[data-depth='" + depth + "']").each(function(){ 
            var nodeWidth = $(this)[0].getBBox().width; 
            if (nodeWidth > maxNodeWidth) {
              maxNodeWidth = nodeWidth;
            }
          });
          maxNodeWidthAtDepths[depth] = maxNodeWidth;
          
        }
        maxNodeWidths += maxNodeWidthAtDepths[depth];
      }      
      d.y = d.depth * 300 + maxNodeWidths * 2; 
    });
                
    var vis = d3.select("#vis g." + sideClass);
              
    var node = vis.selectAll(".node")
        .data(nodes, function(d) { return d.path; });

    var nodeEnter = node.enter().append("g")
        .attr("class", function(d) {
          if (d.path.length <= root.children[d.path[0]].source.length) {
            return "node clickable";
          } else {
            return "node";
          }            
        })
        .attr("data-path", function(d) { return d.path })
        .attr("data-depth", function(d) { return d.depth })
        .attr("transform", function(d) { 
          var x = d.y0, y = d.x0;
          if (d.parent) {
            var x = d.parent.y0;
            var y = d.parent.x0;
          }
          return "translate(" + translateX(x, side) + "," + translateY(y) + ")";
        })
        .on("click", function(d) {          
          if (d.path.length <= root.children[d.path[0]].source.length) {
            if (d.children) {
              nodeClick(d, d.path.slice(0, d.path.length - 1));
            } else {
              nodeClick(d, d.path);
            }
          }
        });
        
    nodeEnter.append("text")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", ".36em")
        .style("fill-opacity", 1e-6)
        .text(function(d) { return d.title; })
        .attr("text-anchor", function(d) { return side > 0 ? "begin": "end"; });
        
    nodeEnter.append("text")
        .attr("class", "subtitle")
        .attr("x", 0)
        .attr("y", "2em")
        .style("fill-opacity", 1e-6)
        .text(function(d) { return d.subtitle; })
        .attr("text-anchor", function(d) { return side > 0 ? "begin": "end"; });
  
     nodeEnter.append("svg:use")
       .attr("xlink:href", "#triangle")
       .style("fill-opacity", 1e-6)
       .attr("transform", function(d) {
         var titleWidth = $(".title", this.parentNode)[0].getBBox().width;
         d.width = titleWidth * 2;
         
         var rotate = "rotate(" + (side > 0 ? 0 : 180) + " 7,9)";
         var translate = "translate(" + ((titleWidth + 3) * side - (side > 0 ? 0 : 13)) + "," + (-9) + ")";
         
         return translate + " " + rotate;        
       });
        
    // Compute center offset 
    // midden van :
    //  rechterkant van node met: data-depth = path.length
    //  linkerkant van node met: data-depth = path.length - 1
      
    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { 
          if (d.depth == 0) {
            // Move subtree's root node y position back to center
            var x = side * subTreeX;
            var y = -translateY(d.x);
            vis.transition()
              .duration(duration)
              .attr("transform", "translate(" + x + "," + y + ")");
          }
          
          return "translate(" + translateX(d.y, side) + "," + translateY(d.x) + ")"; 
        });

    nodeUpdate.selectAll("text, use")
        .style("fill-opacity", 1);
        
    nodeUpdate.selectAll("use")    
        .style("display", function(d) { 
          // TODO: make function isLast(d) or something similar!
          return !(d.children || (d.path.length > 0 && d.path.length > root.children[d.path[0]].source.length)) ? null : "none"; 
        });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { 
          return "translate(" + translateX(clickedNode.y + clickedNode.width + linkSpacing, side) + "," + translateY(clickedNode.x) + ")"; 
        })
        .remove();

    nodeExit.selectAll("text, use")
        .style("fill-opacity", 1e-6);
        
    var diagonal = d3.svg.diagonal()
      .projection(function(d) {
         return [translateX(d.y, side), translateY(d.x)]; 
       });        
                  
    // Update the links…
    var link = vis.selectAll(".link")
        .data(links, function(d) { return [d.source.path, d.target.path]; }); 
        
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("marker-start", "url(#circle-marker)")
        .attr("marker-end", "url(#circle-marker)")
        .attr("d", function(d) {
          var o = {
            x: d.source.x0, 
            y: d.source.y0 + d.source.width + linkSpacing
          };
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", function(d) {          
          var source = {
            x: d.source.x,
            y: d.source.y + d.source.width + linkSpacing
          };
          var target = {
            x: d.target.x,
            y: d.target.y - linkSpacing
          };
          return diagonal({source: source, target: target});
        });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {
            x: clickedNode.x, 
            y: clickedNode.y + clickedNode.width + linkSpacing
          };
          return diagonal({source: o, target: o});
        })
        .remove();   

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });    
                
  }
  
  function setSpinners(enabled) { 
    if (path.length) {       
      var docSpinner = $("#doc tr[data-path='" + path + "'] td:first-child use");
      var visSpinner = $("#vis .node[data-path='" + path + "'] use");    
      if (enabled) {
        docSpinner.attr("xlink:href", "#spinner");
        visSpinner.attr("href", "#spinner");        
      } else {
        docSpinner.attr("xlink:href", "#triangle");
        visSpinner.attr("href", "#triangle");
      }  
    }
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
      
  function nodeClick(node, _path) {    
    path = _path;
        
    // Collapse both Content and Model trees:
    collapse(root.children[0]);
    collapse(root.children[1]);
        
    // Expand root until path:
    expand(root, path);
    
    var d = pathToNode(path);
    
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
        setSpinners(true);
        
        var sourceSparql = replaceDates(source.sparql);
        
        var nextSparql = replaceDates(next.sparql);
        var nextTitle = next.title;
        var nextLongTitle = next.longtitle;
        var nextSubTitle = next.subtitle;
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
            var childLongTitle = replaceVars(nextLongTitle, vars);
            var childSubTitle = replaceVars(nextSubTitle, vars);
            var childDoc = replaceVars(nextDoc, vars);            

            var p = d;
            while (p.parent) {
              if (p.vars) {         
                childSparql = replaceVars(childSparql, p.vars);
                childTitle = replaceVars(childTitle, p.vars);
                childLongTitle = replaceVars(childLongTitle, p.vars);
                childSubTitle = replaceVars(childSubTitle, p.vars);
                childDoc = replaceVars(childDoc, p.vars);            
              }
              p = p.parent;
            }            
            
            var newChild = {
              title: replacePrefixes(childTitle, prefixes),
              longtitle: replacePrefixes(childLongTitle, prefixes),
              subtitle: formatDateTime(replacePrefixes(childSubTitle, prefixes)),
        			doc: childDoc,
        			sparql: childSparql,
              path: d.path.concat([i]),
              vars: vars
            };            
            newChildren.push(newChild);
          }          

          d.children = newChildren;
          update(node);
          setSpinners(false);
        });        
      }      
    } else {
      update(node);
    }  
  }  
}