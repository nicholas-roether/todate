describe("The GraphQL Endpoint", () => {
	before(() => {
		cy.login();
	});

	it("successfully loads", () => {
		cy.visit(`/api/graphql`);
	});
});