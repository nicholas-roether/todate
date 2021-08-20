import dbSeed from "../../fixtures/db-seed.json";

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
				expect(data.reminderExists).to.be.true;
			});
			["611eba8077f7e14488dad000", "611eba8077f7e14488dad001"].forEach((reminderId, index) => {
				cy.graphQL(GET_REMINDER, { id: reminderId }).then(data => {
					const reminderDoc = docMap.reminders.find(doc => doc._id.toString() == reminderId);
					const categoryDoc = reminderDoc.category 
						? docMap.categories.find(doc => doc._id.toString() == reminderDoc.category)
						: null;
										
					expect(data.getReminder).to.deep.equal({
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
		});
	});
});