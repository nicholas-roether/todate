describe("Auth0", () => {
	before(() => {
		cy.login();
	});

	it("logs in", () => {
		cy.request("/api/auth/me").then(({ body: user }) => {
			expect(user.email).to.equal(Cypress.env("auth0Username"));
		})
	});
})