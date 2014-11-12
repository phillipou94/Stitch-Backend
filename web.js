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

//******* 						Highlights 							*******///

//get request for highlights. just return quote and articleTitle to speed up process
app.get('/highlights/:id',function(req,res){
	var collection = db.collection("highlights")
	collection.find({"userID": req.params.id }, {"quote":1, "articleTitle":1, "url":1, "username":1, "userID":1, "favoritedByUsers":1}).sort({dateCreated:1}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})

app.get('/highlights',function(req,res){
	var collection = db.collection("highlights")
	collection.find({}, {"quote":1, "articleTitle":1, "url":1, "username":1, "userID":1, "favoritedByUsers":1}).sort({dateCreated:1}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})

app.get('/highlights/random',function(req,res){
	var collection = db.collection("highlights")
	collection.find({}, {"quote":1, "articleTitle":1, "url":1, "username":1, "userID":1, "favoritedByUsers":1}).limit(5).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})


//when you select a highlight, load full highlight
app.get('/highlights/:id/selected',function(req,res){
	var collection = db.collection("highlights")
	console.log("selected highlight")
	collection.find({"_id": new mongoskin.ObjectID(req.params.id)}, {}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})

//get request for favorites
app.get('/highlights/:id/favorites',function(req,res){
	var collection = db.collection("highlights")
	
	//check to see if userID is a key in dictionary by seeing if it returns a value
	//return everything not equal to null ($ne:null)
	
	var query = {}
	query["favoritedByUsers." + req.params.id] = { $ne: null }
	
	console.log(query)
	collection.find(query, {"quote":1, "articleTitle":1, "url":1, "username":1, "userID":1, "favoritedByUsers":1}).sort({dateCreated:1}).toArray(function(e,results){
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

//delete request for highlights
app.delete('/highlights/:id', function(req,res){ //pass parameter id.
	console.log("yep")
	var collection = db.collection("highlights")

	collection.removeById(req.params.id, function(e, result){
		if (e) return next(e)
			res.send((result===1)?{msg: 'success'}:{msg:'error'})
	})
})

//when you click the favorite button
app.put('/highlights/:id/update', function(req, res, next) {
 var collection = db.collection('highlights')
 var str1 = "favoritedByUsers"; //key
 console.log("please put");
  collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    {favoritedByUsers:req.body}}, {safe: true, multi: false}, function(e, result){
    if (e) res.status(500).send()
    res.send(req.body)
  })
})



//******* 						Users							*******///

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
	collection.find({"userID": req.params.id },{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

app.get('/users/:searchParam/search',function(req,res){
	var collection = db.collection("users")
	collection.find({"username": req.params.searchParam },{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

//{$text:req.params.searchParam }



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
//******* 						Messages  							*******///

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
	collection.find({"recipientIDs": req.params.id }, {"quote":1, "senderName":1, "senderID":1, "read":1}).sort({dateCreated:1}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

//when you select a message, load full highlight
app.get('/messages/:id/selected',function(req,res){
	var collection = db.collection("messages")
	console.log("selected highlight")
	collection.find({"_id": new mongoskin.ObjectID(req.params.id)}, {}).toArray(function(e,results){
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

//******* 						Notification 							*******///
//post request for notifications
app.post('/notifications', function(req,res){
	var collection = db.collection("notifications")
	console.log(req.body)
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

//when you select a message, load full highlight
app.get('/notifications/:id',function(req,res){
	var collection = db.collection("notifications")
	console.log("selected highlight")
	collection.find({"toUserID":req.params.id}, {}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})

app.get('/notifications',function(req,res){
	var collection = db.collection("notifications")
	console.log("selected highlight")
	collection.find({}, {}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})



//******* 						Favorites  							*******///

//post request for messages
/*app.post('/favorites', function(req,res){
	var collection = db.collection("favorites")
	collection.insert(req.body,{},function(e,results){
		if (e) res.status(500).send()
			res.send(results)
	})
})

app.get('/favorites/:id',function(req,res){
	var collection = db.collection("favorites")
	collection.find({"favoritedByID": req.params.id }, {"articleTitle":1, "quote":1, "favoritedByID":1}).sort({dateCreated:1}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})

app.get('/favorites/:id/selected',function(req,res){
	var collection = db.collection("favorites")
	collection.find({"_id": new mongoskin.ObjectID(req.params.id)}, {}).toArray(function(e,results){
		if(e) res.status(500).send()
		res.send(results)
	})
})*/
