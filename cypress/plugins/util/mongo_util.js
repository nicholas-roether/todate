/**
 * @param {string} uri the uri
 * @returns {string} the server address
 */
function getDBServerAddress(uri) {
	return uri.substr(0, uri.lastIndexOf("/"));
}

/**
 * @param {string} uri the uri
 * @returns {string} the database name
 */
function getDatabaseName(uri) {
	let end = uri.indexOf("?");
	if (end == -1) end = null;
	return uri.substr(uri.lastIndexOf("/") + 1, end);
}

module.exports = {
	getDBServerAddress,
	getDatabaseName
};
