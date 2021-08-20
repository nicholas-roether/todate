/// <reference types="cypress" />

const encryptTask = require("cypress-nextjs-auth0/encrypt");
const seedDB = require("./seedDB");

const mongoUri = "mongodb://localhost:27017/test";
const folder = "./cypress/seed";

const dbSeed = require("../fixtures/db-seed.json");


/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on("task", {
		encrypt: encryptTask,
		/**
		 * @param {string} path 
		 * @returns {Promise<seedDB.DocMap>}
		 */
		seedDB: path => {
			return seedDB(mongoUri, dbSeed, path);
		}
	});
}
