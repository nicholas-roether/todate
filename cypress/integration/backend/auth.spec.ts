describe("Auth0", () => {
	before(() => {
		cy.login();
	});

	it("should log in", () => {
		cy.request("/api/auth/me").then(({ body: user }) => {
			expect(user.email).to.equal(Cypress.env("auth0Username"));
		})
	});
})