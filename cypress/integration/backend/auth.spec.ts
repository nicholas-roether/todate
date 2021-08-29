describe("Auth0", () => {
	before(() => {
		cy.login();
	});

	it("logs in correctly", () => {
		cy.request("/api/auth/me").then(({ body: user }) => {
			expect(user, "should log in").to.not.be.null;
			expect(user.email, "should log in to the correct account").to.equal(
				Cypress.env("auth0Username")
			);
		});
	});
});
