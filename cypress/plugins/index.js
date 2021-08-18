/// <reference types="cypress" />

const encryptTask = require("cypress-nextjs-auth0/encrypt");
const path = require("path");
const seeder = require("cypress-mongo-seeder");

const mongouri = "mongodb://localhost:27017/test";
const folder = "./cypress/seed";

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
	on("task", {
		encrypt: encryptTask,
		seedDB: () => {
			return seeder.seedAll(mongouri, folder, true);
		}
	});
}
