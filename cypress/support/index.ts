/// <reference types="cypress" />


import "./commands"

import "cypress-nextjs-auth0";

declare global {
	interface GraphQLResponse {
		title: string,
		query: string,
		variables: {[key: string]: any},
		status: number,
		statusText: string,
		duration: number,
		data: any,
		errors: Error[],
		debug: {[key: string]: any}
	}

	namespace Cypress {
		interface Chainable {
			graphQL: (query: string, variables?: {[key: string]: any}) => Cypress.Chainable<GraphQLResponse>
		}
	}
}