var startVis = function() { 

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 800 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
      
  var path = [];
      
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
  
      //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  d3.xml("static/artsholland.svg", "image/svg+xml", function(xml) {    
    $('#logo').append(xml.documentElement)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  });
  
  
  d3.select("svg")
      .call(d3.behavior.zoom()
            .scaleExtent([1, 2])
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


  // Load data

  /*var contents = {}
  d3.json("contents.json", function(json) {
    contents = json;
  });*/
  
  var prefixes = {}
  d3.json("prefixes.json", function(json) {
    prefixes = json;
  });
  
  var root;
  d3.json("tree.json", function(json) {
    root = json;
    update();
  });
   
  function update() {
    drawTree(root.children[0], -1, 50);
    drawTree(root.children[1],  1, 50);
    
    //gebruik path om nieuwe datastructuur te grijpen met tekst en sparql en knoppen
    
  }  
  
  function drawTree(root, side, offset) {
    // Recompute the layout and data join.
    
    var nodes = tree.nodes(root);    
    
    var elbow = function(d, i) {
      return "M" + (d.source.y / 2 * side + width / 2 + offset * side) + "," + d.source.x
           + "H" + (d.target.y / 2 * side  + width / 2 + offset * side) + "V" + d.target.x
           + (d.target.children ? "" : "h" + margin.right);
    }
    
    var link = vis.selectAll(".link")
        .data(tree.links(nodes), function(d) { return [d.source.path, d.target.path]; })
        .attr("d", elbow)
      .enter().append("path")
        .attr("class", "link")
        .attr("d", elbow);

    var node = vis.selectAll(".node")
        .data(nodes, function(d) { return d.path; })
        .attr("transform", function(d) { return "translate(" + (d.y / 2 * side + width / 2 + offset * side) + "," + d.x + ")"; })
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + (d.y / 2 * side + width / 2 + offset * side) + "," + d.x + ")"; })

    node.append("text")
        .attr("class", "name")
        .attr("x", 8)
        .attr("y", -6)
        .text(function(d) { return d.title; })
        .attr("text-anchor", function(d) { return side > 0 ? "begin": "end"; })
        .on("click", function(d) {
          nodeClick(d);
        });
        
  }
  
  function nodeClick(d) {
    path = d.path;
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
      
      if (source) {
        var sparql = source.sparql;
        var title = source.title;
        var doc = source.doc;
        
        var p = d;
        while (p.parent) {
          if (p.vars) {
            sparql = replaceVars(sparql, p.vars);
          }
          p = p.parent;
        } 
        
        executeSPARQL(replaceDates(sparql), function(results) {
          
          var newChildren = [];
          for (var i = 0; i < results.length; i++) {
            var vars = results[i];      
            var newChild = {
              title: replacePrefixes(getVar(source.child_title, vars), prefixes),
        			doc: doc,
        			sparql: sparql,
              path: d.path.concat([i]),
              vars: vars
            };
            newChildren.push(newChild);
          }          

          d.children = newChildren;
          update();
        });        
      }      
    }    
  }  
}