/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true*/
/* globals io */
"use strict";
var socket;
var main = function (toDoObjects) {
    console.log("SANITY CHECK");
    var toDos = toDoObjects.map(function (toDo) {
          // we'll just return the description
          // of this toDoObject
          return toDo.description;
    });
    
    socket.on("newtodo", function(newToDo){
        toDoObjects.push(newToDo);
        $("div.newTodo").slideDown( "slow" );
        setTimeout(function(){
            $("div.newTodo").hide( "slow" );
        },2000);
        toDos = toDoObjects.map(function (toDo) {
            return toDo.description;
        });
        var $content = $("main .content ul");
        var $active = $(".tabs a span.active");
        
        if ($active.parent().is(":nth-child(1)")){
            $("main .content ul li:eq(0)").before($("<li style='display:none;'>").text(newToDo.description));
            $("main .content ul li:eq(0)").slideDown( "slow" );
        }else if ($active.parent().is(":nth-child(2)")){
            $content.append($("<li style='display:none;'>").text(newToDo.description));
            $content.find("li:last").slideDown( "slow" );
        }else if ($active.parent().is(":nth-child(3)")){
            newToDo.tags.forEach(function(item,i){
                console.log(i);
                var $headings = $("main .content h3");
                var isAdded = false, count = $headings.length;
                $headings.each(function(h,head){
                    if(head.innerHTML === item){
                        $(head).next("ul").append($("<li style='display:none;'>").text(newToDo.description));
                        $(head).next("ul").find("li:last").slideDown( "slow" );
                        isAdded = true;
                    }
                    if( !--count && !isAdded){
                        $("main .content").append($("<h3 style='display:none;'>").text(item));
                        $("main .content").append($("<ul>"));
                        $("main .content ul:last").append($("<li style='display:none;'>").text(newToDo.description));
                        $("main .content h3:last").slideDown( "slow" );
                        $("main .content ul:last").find("li:last").slideDown( "slow" );
                    }
                });
            });
        }
    });

    $(".tabs a span").toArray().forEach(function (element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function () {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();

            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul>");
                for (i = toDos.length-1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul>");
                toDos.forEach(function (todo) {
                    $content.append($("<li>").text(todo));
                });

            } else if ($element.parent().is(":nth-child(3)")) {
                var tags = [];

                toDoObjects.forEach(function (toDo) {
                    toDo.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function (tag) {
                    var toDosWithTag = [];

                    toDoObjects.forEach(function (toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return { "name": tag, "toDos": toDosWithTag };
                });

                console.log(tagObjects);

                tagObjects.forEach(function (tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul>");

                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });

            } else if ($element.parent().is(":nth-child(4)")) {
                var $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: ");
                    
                $input = $("<input>").addClass("description");
                $button = $("<span>").text("+");

                $button.on("click", function () {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","),
                        newToDo = {"description":description, "tags":tags};
                    if(description !== "" && tags[0] !== ""){
                        socket.emit("newtodo", newToDo);
                        $input.val("");
                        $tagInput.val("");
                    }else{
                        window.alert("Please add description and tags separated by comma.");
                    }
                });

                $content = $("<div>").append($inputLabel)
                                     .append($input)
                                     .append($tagLabel)
                                     .append($tagInput)
                                     .append($button);
            }

            $("main .content").append($content);
            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function () {
    $.getJSON("todos.json", function (toDoObjects) {
        main(toDoObjects);
    });
    socket = io();
});
