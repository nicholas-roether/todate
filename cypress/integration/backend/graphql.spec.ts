// Studpid hack to trick vscode into doing syntax highlighting
const gql: (t: TemplateStringsArray) => string = t => t.raw.join("");

const REMINDER_EXISTS = gql`
	query($id: ID!) {
		reminderExists(id: $id)
	}
`;

const GET_REMINDER = gql`
	query($id: ID!) {
		getReminder(id: $id) {
			id,
			title,
			description,
			updatedAt,
			createdAt,
			dueAt,
			duration,
			notificationOffsets,
			category {
				id,
				name,
				icon,
				expandByDefault
			}
		}
	}
`;

const GET_REMINDER_CATEGORY_ID = gql`
	query($id: ID!) {
		getReminder(id: $id) {
			category {
				id
			}
		}
	}
`;

const CATEGORIZE_REMINDER = gql`
	mutation($reminderId: ID!, $categoryId: ID!) {
		categorizeReminder(reminderId: $reminderId, categoryId: $categoryId) {
			id
		}
	}
`;

describe("The GraphQL Endpoint", () => {
	before(() => {
		cy.login();
	});

	it("successfully loads", () => {
		cy.visit(`/api/graphql`);
	});

	it("correctly reads reminders", () => {
		cy.task<seedDB.DocMap>("seedDB", "reminderReadTest").then(docMap => {
			cy.graphQL(REMINDER_EXISTS, { id: "611eba8077f7e14488dad000" }).then(data => {
				expect(data.reminderExists, "should return true if reminder exists").to.be.true;
			});
			cy.graphQL(REMINDER_EXISTS, { id: "611eba8077f7e14488dad999" }).then(data => {
				expect(data.reminderExists, "should return false if reminder doesn't exist").to.be.false;
			});
			["611eba8077f7e14488dad300", "611eba8077f7e14488dad000"].forEach((reminderId, index) => {
				cy.graphQL(GET_REMINDER, { id: reminderId }).then(data => {
					const reminderDoc = docMap.reminders.find(doc => doc._id.toString() == reminderId);
					const categoryDoc = reminderDoc.category 
						? docMap.categories.find(doc => doc._id.toString() == reminderDoc.category)
						: null;
										
					expect(data.getReminder, "should correctly return reminder data by id").to.deep.equal({
						id: reminderDoc._id,
						title: reminderDoc.title,
						description: reminderDoc.description,
						updatedAt: reminderDoc.updatedAt,
						createdAt: reminderDoc.createdAt,
						dueAt: reminderDoc.dueAt,
						duration: reminderDoc.duration,
						notificationOffsets: reminderDoc.notificationOffsets,
						category: categoryDoc ? {
							id: categoryDoc._id,
							name: categoryDoc.name,
							icon: categoryDoc.icon,
							expandByDefault: categoryDoc.expandByDefault
						} : null
					});
				});
			});
			cy.graphQL(GET_REMINDER, { id: "611eba8077f7e14488dad301" }).then(data => {
				expect(data.getReminder, "should not return unowned reminders").to.be.null;
			});
			cy.graphQL(GET_REMINDER_CATEGORY_ID, { id: "611eba8077f7e14488dad001" }).then(data => {
				expect(data.getReminder.category, "should not return unowned category with reminder").to.be.null;
			});
		});
	});

	it("correctly updates reminders", () => {
		cy.task<seedDB.DocMap>("seedDB", "reminderUpdateTest").then(docMap => {
			cy.graphQL(CATEGORIZE_REMINDER, {
				reminderId: "611eba8077f7e14488dad000",
				categoryId: "611eba8077f7e14488dad302"
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad000").then(doc => {
					expect(doc?.category, "category should update").to.equal("611eba8077f7e14488dad302");
				});
			});
			cy.graphQL(CATEGORIZE_REMINDER, {
				reminderId: "611eba8077f7e14488dad301",
				categoryId: "611eba8077f7e14488dad302"
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad301").then(doc => {
					expect(doc?.category, "category of unowned reminder shouldn't update").to.be.null;
				});
			});
			cy.graphQL(CATEGORIZE_REMINDER, {
				reminderId: "611eba8077f7e14488dad001",
				categoryId: "611eba8077f7e14488dad999"
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad001").then(doc => {
					expect(doc?.category, "category should update to one that doesn't exist").to.be.null;
				});
			});
		});
	});
});