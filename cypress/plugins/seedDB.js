const { MongoClient, ObjectId } = require("mongodb");
const { getDBServerAddress, getDatabaseName } = require("./util/mongo_util");

/**
 * 	@typedef {{[key: string]: any}} Doc
 * 	@typedef {{[collection: string]: Doc[]}} DocMap
 * 	@typedef {{[id: string]: any}} DefinitionMap
 * 	@typedef {{
 * 		$global: DocMap,
 * 		$def: DefinitionMap,
 * 	} & DocMap} SeedSource
 */


/**
 * @param {Doc} doc
 * @param {DefinitionMap} definitions
 * 
 * @returns {Doc}
 */
 function parseDoc(doc, definitions = {}) {
	if(Array.isArray(doc)) return parseDocs(doc, definitions);
	if(typeof doc !== "object" || doc === null || doc instanceof ObjectId || doc instanceof Date) return doc;
	const properties = Object.keys(doc);
	if(properties.length == 1) {
		const descriptor = properties[0];
		const value = doc[descriptor];
		switch(descriptor) {
			case "$oid": return new ObjectId(value);
			case "$date": return new Date(value);
			case "$import": return definitions?.[value];
		}
	}
	let result = {};
	if(properties.includes("...$import")) {
		Object.assign(result, definitions?.[doc["...$import"]] ?? {});
		properties.splice(properties.indexOf("...$import"), 1);
	}
	for(let propertyName of properties)
		result[propertyName] = parseDoc(doc[propertyName], definitions);
	return result;
}

/**
 * 
 * @param {Doc[]} docs 
 * @param {DefinitionMap} definitions
 * 
 * @returns {Doc[]}
 */
function parseDocs(docs, definitions = {}) {
	if(!docs) return [];
	return docs.map(doc => parseDoc(doc, definitions));
}

/**
 * @param {DocMap} map 
 * @param {DefinitionMap} definitions
 * 
 * @returns {DocMap}
 */
function parseDocMap(map, definitions) {
	if(!map) return {};
	for(const key in map)
		map[key] = parseDocs(map[key], definitions);
	return map;
}

/**
 * @param  {...DocMap[]} maps
 * 
 * @returns  {DocMap}
 */
function combineDocMaps(...maps) {
	let res = {};
	maps.forEach(map => Object.getOwnPropertyNames(map).forEach(key => {
		res[key] = [
			...(res[key] ?? []),
			...map[key]
		];
	}));
	return res;
}

/**
 * @param {SeedSource} source
 * @param {string} path
 * 
 * @returns {DocMap}
 */
function parseSeed(source, path) {
	let definitions = source.$def ?? {};
	for(const id in definitions)
		definitions[id] = parseDoc(definitions[id]);
	
	let global = parseDocMap(source.$global, definitions);
	let local = parseDocMap(source[path], definitions);
	
	return combineDocMaps(global, local);
}

/**
 * @param {SeedSource} source 
 * @param {string} path
 * 
 * @returns {Promise<DocMap>}
 */
async function seedDB(mongoUri, source, path) {
	const docMap = parseSeed(source, path);
	const serverAddress = getDBServerAddress(mongoUri)
	const dbName = getDatabaseName(mongoUri);
	const client = new MongoClient(serverAddress);
	await client.connect();
	const db = client.db(dbName);
	for(const collectionName in docMap) {
		const collection = db.collection(collectionName);
		await collection.deleteMany();
		await collection.insertMany(docMap[collectionName]);
	}
	await client.close();
	return docMap;
}

module.exports = seedDB