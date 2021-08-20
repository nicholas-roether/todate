
/**
 * NOTE: Part of this code was copied from BrandedEntertainmentNetwork/cypress-rest-graphql on github.
 */

Cypress.Commands.add("graphQL", (query: string, variables: {[key: string]: any} = {}) => {
	const graphQLPath = Cypress.env("graphQLPath") ?? "/api/graphql";
	// const url = `${Cypress.config().baseUrl}/${graphQLPath}`;
	const url = new URL(graphQLPath, Cypress.config().baseUrl);
	return cy.request({
		method: "POST",
		url: url.toString(),
		body: {query, variables},
		failOnStatusCode: false
	}).then(res => {
		const {
			duration,
			body: { errors, data },
			status,
			statusText,
			...debug
		} = res;
		const title = `${query.substring(0, query.indexOf("("))}`;
		const message = `${title} - ${duration}ms (${statusText})`;

		const props: GraphQLResponse = {
			title,
			query,
			variables,
			status,
			statusText,
			duration,
			data,
			errors,
			debug
		};

		Cypress.log({
			name: "GraphQL",
			message,
			consoleProps() {
				return props;
			}
		});
		
		if(errors?.length > 0) throw errors[0];
		return data;
	})
});