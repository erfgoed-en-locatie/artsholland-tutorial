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
