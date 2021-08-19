/// <reference types="cypress" />

const encryptTask = require("cypress-nextjs-auth0/encrypt");
const path = require("path");
const seeder = require("cypress-mongo-seeder");
const { MongoClient, ObjectID } = require("mongodb");

const mongouri = "mongodb://localhost:27017/test";
const folder = "./cypress/seed";

/**
 * @typedef {{[key: string]: any}} Doc
 * @typedef {{[collection: string]: Doc[]]}} DatabaseSeed
 */

// /**
//  * @param {Doc} doc 
//  */
// function parseDoc(doc) {
// 	const ownProperties = Object.getOwnPropertyNames(doc);
// 	if(ownProperties.length == 1) {
// 		const descriptor = ownProperties[0];
// 		const value = doc[descriptor];
// 		switch(descriptor) {
// 			case "$oid": return new ObjectID(value);
// 			case "$date": return new Date(value);
// 			// TODO add more...
// 		}
// 	}
// 	let result;
// 	for(let propertyName in doc)
// 		result.propertyName = parseDoc(doc[propertyName]);
// 	return result;
// }

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on("task", {
		encrypt: encryptTask,
		"seedDB:mutations": () => {
			return seeder.seedAll(mongouri, folder + "/mutations", true);
		},
		"seedDB:queries": () => {
			return seeder.seedAll(mongouri, folder + "/queries", true);
		},
		/**
		 * @param {DatabaseSeed} seed
		 */
		async seedDB(seed) {
			const serverAddress = mongouri.substr(0, mongouri.lastIndexOf("/"));
			const dbName = mongouri.substr(mongouri.lastIndexOf("/") + 1);
			const client = new MongoClient(serverAddress);
			await client.connect();
			const db = client.db(dbName);
			for(const collectionName in seed) {
				const docs = seed[collectionName];
				const collection = db.collection(collectionName);
				await collection.deleteMany();
				console.log(docs);
				await collection.insertMany(docs);
			}
			return client.close();
		}
	});
}
