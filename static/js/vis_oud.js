var startVis = function() {  
  var m = [20, 120, 20, 120],
      w = 1280 - m[1] - m[3],
      h = 800 - m[0] - m[2],
      i = 0,
      root;

  var tree = d3.layout.tree()
      .size([h, w]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var vis = d3.select("#vis").append("svg:svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  var contents = {}
  d3.json("contents.json", function(json) {
    contents = json;
  }); 
  
  d3.json("tree.json", function(json) {
    root = json;
    root.x0 = h / 2;
    root.y0 = 0;  
  
    update(root);
  });

  function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = vis.selectAll("g.node")
       .data(nodes);

   // Enter any new nodes at the parent's previous position.
   var nodeEnter = node.enter().append("svg:g")
       .attr("class", "node")
       .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
       /*.attr("data-index", function(d) {
         if (d.parent) {
           for (var i = 0; i < d.parent.children.length; i++) {
             if (d.name === d.parent.children[i].name) {
               d.index = i;
               return i;
             }
           }
         }
         d.index = 0;
         return 0;
       })
       .attr("data-path", function(d) {         
         var path = [];
         p = d;
         while (p) {            
           path.push(p.index)
           p = p.parent;
         }         
         // path takes each node index until root is reached.
         // d.path is reverse of path, minus root.
         d.path = path.reverse().slice(1);
         return d.path.join();
       })*/
       .on("click", function(d) { 
         if (!(d.children.length > 0)) {
           ditdoen(d);
         }
       });

   nodeEnter.append("svg:circle")
       .attr("r", 1e-6)
       .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

   nodeEnter.append("svg:text")
       .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
       .attr("dy", ".35em")
       .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
       .text(function(d) { return d.title; })
       .style("fill-opacity", 1e-6);

   // Transition nodes to their new position.
   var nodeUpdate = node.transition()
       .duration(duration)
       .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

   nodeUpdate.select("circle")
       .attr("r", 4.5)
       .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

   nodeUpdate.select("text")
       .style("fill-opacity", 1);

   // Transition exiting nodes to the parent's new position.
   var nodeExit = node.exit().transition()
       .duration(duration)
       .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
       .remove();

   nodeExit.select("circle")
       .attr("r", 1e-6);

   nodeExit.select("text")
       .style("fill-opacity", 1e-6);

   // Update the links…
   var link = vis.selectAll("path.link")
       .data(tree.links(nodes), function(d) { return d.target.name; });

   // Enter any new links at the parent's previous position.
   link.enter().insert("svg:path", "g")
       .attr("class", "link")
       .attr("d", function(d) {
         var o = {x: source.x0, y: source.y0};
         return diagonal({source: o, target: o});
       })
     .transition()
       .duration(duration)
       .attr("d", diagonal);

   // Transition links to their new position.
   link.transition()
       .duration(duration)
       .attr("d", diagonal);

   // Transition exiting nodes to the parent's new position.
   link.exit().transition()
       .duration(duration)
       .attr("d", function(d) {
         var o = {x: source.x, y: source.y};
         return diagonal({source: o, target: o});
       })
       .remove();

   // Stash the old positions for transition.
   nodes.forEach(function(d) {
     d.x0 = d.x;
     d.y0 = d.y;
   });

  }
 
  var ditdoen = function(d) {
    if (!(d.children.length > 0)) {
      
      d.path = [0];

      // functie: source from path
      var source = null;
      if (d.path.length == 1) {
        source = contents.children[d.path[0]]
      } else if (d.path.length > 1) {
        source = contents.children[d.path[0]].source[d.path.length - 1];
      }
      
      if (source) {
        var sparql = source.sparql;
        var title = source.title;
        
        executeSPARQL(replaceDates(sparql), function(results) {
          
          var newChildren = [];
          for (var i = 0; i < results.length; i++) {
            var vars = results[i];      
            var newChild = {
              "title": vars["city"]
            };
            newChildren.push(newChild);
          }
          
          
          // // Add a new node to a random parent.
//             var n = {id: nodes.length},
//                 p = nodes[Math.random() * nodes.length | 0];
//             if (p.children) p.children.push(n); else p.children = [n];
//             nodes.push(n);
// 
//             // Recompute the layout and data join.
//             node = node.data(tree.nodes(root), function(d) { return d.id; });
//             link = link.data(tree.links(nodes), function(d) { return d.source.id + "-" + d.target.id; });
//           
          
          
          //d.children = newChildren;
          var newnodes = tree.nodes(newChildren).reverse();
          d.children = newnodes[0];
          
          console.log(newChildren);
          update(d); 

        });
        
      }
      
    }
   
  };
 
};  







// $(document).ready(function() {
//   
//   // Main data structure, read from /tree.json
//   // TODO: rename to tree ?
//   var data = {};
//   // Current path in tree, by name of options 
//   // OR USE arrays and index?
//   var path = [];
//   
//   var stepSource = $("#step-template").html();
//   var stepTemplate = Handlebars.compile(stepSource);
//   
//   // TODO: pak nu + 'n week:
//   //dateFrom = "2012-12-01"
//   //dateTo = "2012-12-08"
//   var width = 400;
//   var height = 600;
//   
//   var tree = d3.layout.tree()
//     .size([width, height])
//     .children(function(d) {      
//       return d.options;
//       /*if ("options" in d && d.options.length !== 0) {
//         return d.options;
//       } else if ("results" in d && d.results.length !== 0) {
//         var options = d.results;
//       } else { // Grijp uit source
//         var options = d.source;
//       }
//       var buttons = [];
//       // TODO: replace with for (;;)
//       for (var i in options) {
//         var title = options[i][d.vars.display];
//         var button = {
//           "name": options[i].name,
//           "title": title
//         }
//         buttons.push(button);
//       }
//       return buttons;
//       
//       //return d.children;*/
//     });
//   
//   
//   
//   
//   
// 
//   
//   d3.json("tree.json", function(json) {
//     data = json;
//     update();
//   });
//   
//   var update = function() {
//     
//     var nodes = tree.nodes(data);
// 
//     d3.select("#doc ol")
//       .selectAll("li")
//       .data(nodes)
//       .enter()
//       .append("li")
//       .html(function(d) {    
//         if ("options" in d && d.options.length !== 0) {
//           var options = d.options;
//         }
//         d.buttons = [];
//         for (var name in options) {
//           var title = options[name][d.vars.display];
//           var button = {
//             name: name,
//             title: title,
//             depth: 1
//           }
//           d.buttons.push(button);
//         }
//         //TODO: visible als in pad!
//         var html = stepTemplate(d);
//         return html;
//       });
// 
//     $("textarea:visible").each(function(index) {
//       CodeMirror.fromTextArea(this, {
//         "readOnly": true
//       });    
//     });
//   };
//   
//   $("body").on("click", "button", function() {
//     var name = $(this).attr("data-name");
//     var depth = parseInt($(this).attr("data-depth"));
//     
//     var element = {};
//     var key;
//     
//     element = data.options[name];
//     
//     path = path.slice(0, depth - 1);
//     path.push(name);    
// 
//     var options = data.options;
//     var path_loaded = true;
//     var i = 0;
//     for (i; i <  path.length; i++) {
//       if (!(options && path[i] in options)) {
//         path_loaded = false;
//         break;
//       }
//     }
//     
//     // If path_loaded is false, tree does not contain new path completely 
//     // in options block. Need to fetch en parse from source block.
// 
//     
//     //zoek of bestaat data[path].options[name]
//     //data.options[name]
//     update();
//     
// //     executeSPARQL(element.sparql, function(results) {      
// //       //Fill  data.options[path[0]].options met alle resulataten uit results
// //       
// //       for (var i = 0; i < results.length; i++) {
// //          //data.options[name].options
// //       }
// //       
// // /*      if ("children" in data) {
// //         data.children.push(element);
// //       } else {
// //         data.children = [element];
// //       }*/
// //       update();
// //     });
//     
//   });
// });
