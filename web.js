var express = require('express')
var mongoskin = require('mongoskin')
var bodyParser = require('body-parser')

var app = express()
app.use(bodyParser())

var db = mongoskin.db('http://stitch-backend.herokuapp.com/', {safe:true})

//get request
app.get('/highlights',function(req,res){
	var collection = db.collection("highlights")

	collection.find({}).toArray(function(e,results){
		if(e) res.status(500).send()
			res.send(results)
	})
})
//post request

app.post('/highlights', function(req,rest){
	var collection = db.collection("chat")

	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})


app.listen(3000) //number for the server