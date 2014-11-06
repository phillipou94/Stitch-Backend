// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb'); //npm install
var mongoskin = require('mongoskin'); //npm install
var bodyParser = require('body-parser'); //npm install
var app = express();
var mongoURL = process.env.MONGOLABL_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mdb' //needed to add MONGOHQ to Heroku
var db = mongoskin.db(mongoURL, {safe:true})

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.param('collectionName', function(req,res,next,collectionName){
	req.collection = db.collection(collectionName)
	return next()
})

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

//get request for highlights
app.get('/highlights/:id',function(req,res){
	var collection = db.collection("highlights")
	collection.find({"userID": req.params.id }, {"quote":1}).sort({dateCreated:1}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})

//post request for highlights
app.post('/highlights', function(req,res){
	var collection = db.collection("highlights")
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
		res.send(results)
	})
})

app.post('/highlights/:serverID', function(req,res){
	var collection = db.collection("highlights")
	console.log('putting highlights')
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
	
			console.log("Put Request")
			var userCollection = db.collection("users")
			var key = "arrayOfHighlights"; //key
			var array = [];
			array.push(results[0]._id);
			userCollection.updateById(req.params.serverID, {$set: //inc for integers, set for strings
    			{arrayOfHighlights:array} }, {safe: true, multi: false}, function(e, result){
    				if (e) res.status(500).send()
    				res.send(req.body)
  			})
	})
})

//delete request for highlights
app.delete('/highlights/:id', function(req,res){ //pass parameter id.
	console.log("yep")
	var collection = db.collection("highlights")

	collection.removeById(req.params.id, function(e, result){
		if (e) return next(e)
			res.send((result===1)?{msg: 'success'}:{msg:'error'})
	})
})

//get request from tags
app.get('/tags',function(req,res){
	var collection = db.collection("tags")

	collection.find({},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})
//post request from  tags

app.post('/tags', function(req,res){
	var collection = db.collection("tags")

	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

//delete request tags
app.delete('/tags/:id', function(req,res){ //pass parameter id.
	console.log("yep")
	var collection = db.collection("tags")

	collection.removeById(req.params.id, function(e, result){
		if (e) return next(e)
		res.send((result===1)?{msg: 'success'}:{msg:'error'})
	})
})


//get request for all users
app.get('/users',function(req,res){
	var collection = db.collection("users")

	collection.find({},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

app.get('/users/:id',function(req,res){
	var collection = db.collection("users")
	collection.find({"userID": { $in: [req.params.id ] }},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

app.get('/users/:searchParam/search',function(req,res){
	var collection = db.collection("users")
	collection.find({"username": { $in: [req.params.searchParam ] }},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})



//post request from users
app.post('/users', function(req,res){
	var collection = db.collection("users")
	console.log("Put Request")
	console.log(req.body)
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

app.post('/:id', function(req,res){
	var collection = db.collection(req.params.id)
	console.log("Put Request!!!")
	console.log(req.params.id)
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

//get request from users
app.get('/:id',function(req,res){
	var collection = db.collection(req.params.id)
	collection.find({},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

//delete request from users
app.delete('/users/:id', function(req,res){ //pass parameter id.
	console.log("yep")
	var collection = db.collection("users")
	collection.removeById(req.params.id, function(e, result){
		if (e) return next(e)
		res.send((result===1)?{msg: 'success'}:{msg:'error'})
	})
})


app.put('/users/:id/following', function(req, res, next) {
 var collection = db.collection('users')
 var str1 = "followingDictionary"; //key
 var action = {};
 action[str1] = req.body;
  collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    {followingDictionary:req.body}
  }, {safe: true, multi: false}, function(e, result){
    if (e) res.status(500).send()
    res.send(req.body)
  })
})

app.put('/users/:id/followers', function(req, res, next) {
 var collection = db.collection('users')
 var str1 = "followersDictionary"; //key
 var action = {};
 console.log(req.body)
 action[str1] = req.body;
  collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    {followersDictionary:req.body}
  }, {safe: true, multi: false}, function(e, result){
    if (e) res.status(500).send()
    res.send(req.body)
  })
})

//post request for messages
app.post('/messages', function(req,res){
	var collection = db.collection("messages")
	console.log("Post Request")
	console.log(req.body)
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

//get messages for a specific user
app.get('/messages/:id',function(req,res){
	var collection = db.collection("messages")
	collection.find({"recipientIDs": { $in: [req.params.id ] }},{"sort" : [['dateCreated', 'asc']]}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

//update recipientIDs when user deletes a message
app.put('/messages/:id/update', function(req, res, next) {
	var collection = db.collection('messages')
 	var str1 = "recipientIDs"; //key
 	var action = {};
 	console.log("Put Request")
 	action[str1] = req.body;
 	collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    	{recipientIDs:req.body}
  	}, {safe: true, multi: false}, function(e, result){
    	if (e) res.status(500).send()
    	res.send(req.body)
  	})
})

//indicate user has read the message
app.put('/messages/:id/reader', function(req, res, next) {
	var collection = db.collection('messages')
 	var str1 = "read"; //key
 	var action = {};
 	console.log("Put Request")
 	action[str1] = req.body;
 	collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    	{read:req.body}
  	}, {safe: true, multi: false}, function(e, result){
    	if (e) res.status(500).send()
    	res.send(req.body)
  	})
})
