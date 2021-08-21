const { MongoClient, ObjectId } = require("mongodb");
const { getDBServerAddress, getDatabaseName } = require("./util/mongo_util");

/**
 * @param {string} mongoUri The mongoDB uri
 * @param {string} identifier The entry identifier: <collection>:<id>
 * @returns {Promise<any>} The document
 */
async function findDBEntry(mongoUri, identifier) {
	let [collectionName, id] = identifier.split(":");
	const serverAddress = getDBServerAddress(mongoUri);
	const dbName = getDatabaseName(mongoUri);
	const client = new MongoClient(serverAddress);
	await client.connect();
	const db = client.db(dbName);
	const collection = db.collection(collectionName);
	if(!(id instanceof ObjectId)) id = new ObjectId(id);
	const doc = await collection.findOne({ "_id": id });
	return doc ?? null;
}

module.exports = findDBEntry;