var startVis = function() { 

  var m = 10,
      margin = {top: m, right: m, bottom: m, left: m},
      width = 1075 - margin.left - margin.right,
      height = 804 - margin.top - margin.bottom;

  var tree = d3.layout.tree()
      .size([width, height]);

  var contents = {}
  d3.json("contents.json", function(json) {
    contents = json;
  });
  
  var prefixes = {}
  d3.json("prefixes.json", function(json) {
    prefixes = json;
  });
  
  var root, nodes;
  d3.json("tree.json", function(json) {
    root = json;
    nodes = tree(root);
    
    root.parent = root;
    root.px = root.x;
    root.py = root.y;
    
    update();
  });

  var svg = d3.select("#vis").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")");

  var node = svg.selectAll(".node"),
      link = svg.selectAll(".link");

   
  function update() {
    drawTree(root.children[0], -1, 100);
    //drawTree(root.children[1], 1, 100);
  }  
  
  function drawTree(_root, side, offset) {
    // Recompute the layout and data join.
    var _nodes = tree.nodes(_root);    
    node = node.data(_nodes, function(d) { return d.id; });
    link = link.data(tree.links(_nodes), function(d) { return d.source.id + "-" + d.target.id; });

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
    
    var nodeEnter = node.enter();  

    nodeEnter.append("circle")
        .attr("class", "node")
        .attr("r", 9)
        .attr("cx", function(d) { return d.parent.py; })
        .attr("cy", function(d) { return d.parent.px; })
        .on("click", function(d) {
          nodeClick(d);
        });
    
    nodeEnter.append("svg:text")
        .attr("class", "nodetext")
        .attr("x", function(d) { return d.parent.py + 15; })
        .attr("y", function(d) { return d.parent.px + 5; })      
        .text(function(d) { return d.title; })

    // Add entering links in the parent’s old position.
    link.enter().insert("path", ".node")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: d.source.py * side, y: d.source.px};
          return diagonal({source: o, target: o});
        });

    // Transition nodes and links to their new positions.
    var t = svg.transition()
        .duration(200);

    t.selectAll(".link")
        .attr("d", diagonal);

    t.selectAll(".node")
        .attr("cx", function(d) { return d.py = d.y; })
        .attr("cy", function(d) { return d.px = d.x; });
    
    t.selectAll(".nodetext")
        .attr("x", function(d) { return d.py = d.y + 15; })
        .attr("y", function(d) { return d.px = d.x + 5; });  
  }
  
  function nodeClick(d) {
    if (!d.children) {
      d.children = [];

      // functie: source from path
      var source;
      if (d.path.length == 1) {
        source = contents.children[d.path[0]]
      } else if (d.path.length > 1) {
        if (contents.children[d.path[0]].source.length >= d.path.length - 1) {
          source = contents.children[d.path[0]].source[d.path.length - 2];
        }
      }
      
      if (source) {
        var sparql = source.sparql;
        var title = source.title;
        
        var p = d;
        while (p.id != 0) {
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
              id: nodes.length + i,
              title: replacePrefixes(getVar(source.child_title, vars), prefixes),
              path: d.path.concat([i]),
              vars: vars
            };
            newChildren.push(newChild);
          }          

          d.children = newChildren;
          nodes = nodes.concat(newChildren);

          update();

        });        
      }      
    }    
  }  
}