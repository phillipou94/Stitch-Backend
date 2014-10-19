// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb'); //npm install
var mongoskin = require('mongoskin'); //npm install
var bodyParser = require('body-parser'); //npm install
var app = express();
var mongoURL = process.env.MONGOLABL_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mdb' //needed to add MONGOHQ to Heroku
var db = mongoskin.db(mongoURL, {safe:true})

app.use(bodyParser())
//express.bodyParser({limit:'100mb'})
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.param('collectionName', function(req,res,next,collectionName){
	req.collection = db.collection(collectionName)
	return next()
})

app.use(logfmt.requestLogger());

// new 
app.use('/', express.bodyParser({
  keepExtensions: true,
  limit: 1024 * 1024 * 10,
  defer: true              
}));
app.use('/highlights', express.bodyParser({
  keepExtensions: true,
  limit: 1024 * 1024 * 1024 * 500,
  defer: true              
}));

//


app.get('/', function(req, res) {
  res.send('Hello World!');

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

//get request for highlights
app.get('/highlights',function(req,res){
	var collection = db.collection("highlights")

	collection.find({},{}).toArray(function(e,results){
		console.log(e);
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


//get request from users
app.get('/users',function(req,res){
	var collection = db.collection("users")

	collection.find({},{}).toArray(function(e,results){
		console.log(e);
		if(e) res.status(500).send()
			res.send(results)
	})
})
//post request from users

app.post('/users', function(req,res){
	var collection = db.collection("users")

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


/*app.put('/users/:id', function(req, res, next) {

  var collection = db.collection('users')

  var str1 = "followingDictionary"; //key
  //var str2 = req.params.array;
  //var variable = str1.concat(str2);
  
 var action = {};

 action[str1] = req.body;
  collection.updateById(req.params.id, {$set: //inc for integers, set for strings
    followingDictionary:req.body}
  }, {safe: true, multi: false}, function(e, result){
    if (e) res.status(500).send()
    
  })
})
*/