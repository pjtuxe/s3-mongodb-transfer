const MongoClient = require('mongodb').MongoClient;
const config = require('./config.service')

const client = new MongoClient(config.mongodb.connectionString, {
    useUnifiedTopology: true,
})
var db


client.connect(function (err) {
    if (err) {
        // TODO: error logging
    }

    db = client.db(config.mongodb.dbName);
    console.log("mongodb connected")
});

module.exports = {
    client,
    getDB: function () {
        return db
    }
};
