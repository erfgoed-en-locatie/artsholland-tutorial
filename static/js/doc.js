var startDoc = function() {  

  // Main data structure, read from /tree.json
  var data = {};  
  d3.json("tree.json", function(json) {
    data = json;
    update(data);
  });  
  
  
  // Current path in tree, by index of children
  // (tree root is always displayed)
  var path = [];
  
  var stepSource = $("#step-template").html();
  var stepTemplate = Handlebars.compile(stepSource);

  var width = 500;
  var height = 500;  
  
  var tree = d3.layout.tree()
    .size([width, height]);    
     
  var list = d3.select("#doc").append("ol");
       
//    .children(function(d) {      
//      return d.children;
      /*if ("options" in d && d.options.length !== 0) {
        return d.options;
      } else if ("results" in d && d.results.length !== 0) {
        var options = d.results;
      } else { // Grijp uit source
        var options = d.source;
      }
      var buttons = [];
      // TODO: replace with for (;;)
      for (var i in options) {
        var title = options[i][d.vars.display];
        var button = {
          "name": options[i].name,
          "title": title
        }
        buttons.push(button);
      }
      return buttons;
      
      //return d.children;*/
    //});
    
    
  var update = function(source) {
        
    var nodes = tree.nodes(data);
    
    // DATA JOIN
    // Join new data with old elements, if any.
    var li = list.selectAll("li")
        .data(nodes, function(d) { return d.name; });
        
    // UPDATE
    // Update old elements as needed.
    // li.attr("class", function(d) {
    //     // TODO: als in path
    //     if (d.children.length == 0) { // TODO: Unless d is de laatste in de tree
    //       return "hidden";
    //     }
    //     return "";
    //   })

    // ENTER
    // Create new elements as needed.
    li.enter().append("li")
      .attr("data-index", function(d) {
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
      .attr("data-depth", function(d) {
        return d.depth;
      })
      .attr("data-path", function(d) {         
        var dPath = [];
        p = d;
        while (p) {            
          dPath.push(p.index)
          p = p.parent;
        }         
        // dPath takes each node index until root is reached.
        // Path is reverse of dPath, minus root.
        return dPath.reverse().slice(1).join();
      })
      .attr("data-name", function(d) {
        return d.name;
      })
      .attr("class", function(d) {
        // TODO: als in path
        // if (d.children.length == 0) { // TODO: Unless d is de laatste in de tree
        //   return "hidden";
        // }
        return "";
      })
      .html(function(d) {                  
        var t = {
          "title": d.title,
          "doc": d.doc,
          "sparql": d.sparql ? replaceDates(d.sparql) : null,
          "buttons": []
        };
        for (var i = 0; i < d.children.length; i++) {  
          // Add new button:
          t.buttons.push({
            title: d.children[i].title,
            index: i,
            depth: d.depth + 1
          });            
        } 
                
        return stepTemplate(t);
      });
      
    // EXIT
    // Remove old elements as needed.
    li.exit().remove();

    $("textarea:visible").each(function(index) {
      CodeMirror.fromTextArea(this, {
        //"readOnly": true
      });    
    });
  };  
  
  $("body").on("click", "button", function() {
    
    // // TODO: start spinner NU!
    // 
    // var liPath = $(this).closest('li').attr("data-path")
    //   .split(",")
    //   .map(function(num) { return parseInt(num) })
    //   .filter(function(num) { return (num >= 0) });
    // var buttonIndex = parseInt($(this).attr("data-index"));
    // 
    // // Set path to <li>'s path + button index:
    // path = liPath.concat([buttonIndex]);
    // 
    // var d = data;
    // for (var i = 0; i < path.length; i++) {
    //   d = d.children[i];
    // }
    //     
    // if (!(d.children.length > 0)) {      
    //   insertChildren(data, d, path, function(children) {
    //     var newNodes = tree.nodes(children);    
    // 
    //     d.children = newNodes[0];
    //     update(d);
    //     
    //     // TODO: stop spinner NU!
    //   });      
    // }   
    
  });  
  
};
