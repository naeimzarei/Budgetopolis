var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/learnMongo'

MongoClient.connect(url, function(err, db) {
	console.log("Connected successfully to server")

	db.close();
})
