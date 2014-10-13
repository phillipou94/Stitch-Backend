// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');
var mongoskin = require('mongoskin');
var bodyParser = require('body-parser');
var app = express();


var mongoURL = process.env.MONGOLABL_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mdb'
var db = mongoskin.db(mongoURL, {safe:true})

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

//get request
app.get('/highlights',function(req,res){
	var collection = db.collection("highlights")

	collection.find({},{}).toArray(function(e,results){
		if(e) res.status(500).send()
			res.send(results)
	})
})
//post request

app.post('/highlights', function(req,rest){
	var collection = db.collection("highlights")

	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})
