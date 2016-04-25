/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */

"use strict";
var express = require("express"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost:27017/amazeriffic");

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

http.listen(3000);

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

io.on("connection", function(socket){
    console.log("a user connected");
    
    socket.on("newtodo", function (msg) {
        console.log(msg);
        var newToDo = new ToDo({ "description": msg.description, "tags": msg.tags });
        newToDo.save(function (err, result) {
            if (err !== null) {
                // the element did not get saved!
                console.log(err);
            } else {
                console.log(result);
                io.emit("newtodo", msg);
            }
        });
    });
    
    /** a user disconnected */
    socket.on("disconnect", function(){
        console.log("user disconnected");
    });
});
