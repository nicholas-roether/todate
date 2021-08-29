/// <reference types="cypress" />

const encryptTask = require("cypress-nextjs-auth0/encrypt");
const seedDB = require("./seedDB");
const findDBEntry = require("./findDBEntry");

const mongoUri = "mongodb://localhost:27017/test";

const dbSeed = require("../fixtures/db-seed.json");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on("task", {
		encrypt: encryptTask,
		/**
		 * @param {string} path The dataset path to seed
		 * @returns {Promise<seedDB.DocMap>} The seeded document map
		 */
		seedDB: (path) => {
			return seedDB(mongoUri, dbSeed, path);
		},
		/**
		 * @param {string} identifier The entry identifier: <collection>:<id>
		 * @returns {Promise<any>} The document
		 */
		findDBEntry: (identifier) => {
			return findDBEntry(mongoUri, identifier);
		}
	});
};
