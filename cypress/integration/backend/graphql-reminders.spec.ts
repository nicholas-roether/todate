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

const UPDATE_REMINDER = gql`
	mutation(
		$id: ID!,
		$title: String,
		$description: String,
		$dueAt: Date,
		$duration: Int,
		$wholeDay: Boolean,
		$categoryId: ID,
		$notificationOffsets: [Int!]
		$addNotificationOffsets: [Int!],
		$removeNotificationOffsets: [Int!]
	) {
		updateReminder(
			id: $id
			title: $title
			description: $description
			dueAt: $dueAt
			duration: $duration
			wholeDay: $wholeDay
			categoryId: $categoryId
			notificationOffsets: $notificationOffsets
			addNotificationOffsets: $addNotificationOffsets
			removeNotificationOffsets: $removeNotificationOffsets
		) { 
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
			cy.graphQL(REMINDER_EXISTS, { id: "611eba8077f7e14488dad000" }).then(({ data }) => {
				expect(data.reminderExists, "should return true if reminder exists").to.be.true;
			});
			cy.graphQL(REMINDER_EXISTS, { id: "611eba8077f7e14488dad999" }).then(({ data }) => {
				expect(data.reminderExists, "should return false if reminder doesn't exist").to.be.false;
			});
			["611eba8077f7e14488dad300", "611eba8077f7e14488dad000"].forEach((reminderId, index) => {
				cy.graphQL(GET_REMINDER, { id: reminderId }).then(({ data }) => {
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
			cy.graphQL(GET_REMINDER, { id: "611eba8077f7e14488dad301" }).then(({ data }) => {
				expect(data.getReminder, "should not return unowned reminders").to.be.null;
			});
			cy.graphQL(GET_REMINDER_CATEGORY_ID, { id: "611eba8077f7e14488dad001" }).then(({ data }) => {
				expect(data.getReminder.category, "should not return unowned category with reminder").to.be.null;
			});
		});
	});

	it("correctly updates reminders", () => {
		cy.task<seedDB.DocMap>("seedDB", "reminderUpdateTest").then(docMap => {
			const testUpdate = {
				title: "Updated Reminder",
				description: "This reminder was programmatically updated",
				dueAt: new Date("2021-08-21T18:05:40.998Z"),
				duration: 20,
				wholeDay: true,
				notificationOffsets: [ 69, 420 ],
			}
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad300",
				...testUpdate
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad300").then(doc => {
					expect(doc.title, "should update title").to.equal(testUpdate.title);
					expect(doc.description, "should update description").to.equal(testUpdate.description);
					expect(doc.dueAt, "should update dueAt").to.equal(testUpdate.dueAt.toISOString());
					expect(doc.duration, "should update duration").to.equal(testUpdate.duration);
					expect(doc.wholeDay, "should update wholeDay").to.equal(testUpdate.wholeDay);
					expect(doc.notificationOffsets, "should update notificationOffsets").to.have.members(testUpdate.notificationOffsets);
				});
			});

			// notificationOffsets stuff
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad003",
				addNotificationOffsets: [ 69, 420 ]
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad003").then(doc => {
					expect(doc?.notificationOffsets, "should correctly add notification offsets").to.have.members([ 10, 69, 420 ]);
				});
			});
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad004",
				removeNotificationOffsets: [ 2, 3, 6 ]
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad004").then(doc => {
					expect(doc?.notificationOffsets, "should correctly remove notification offsets").to.have.members([ 1, 4, 5 ]);
				});
			});
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad005",
				addNotificationOffsets: [ 69, 420 ],
				removeNotificationOffsets: [ 2, 3, 6 ]
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad005").then(doc => {
					expect(doc?.notificationOffsets, "should correctly add and remove notification offsets simultaneously").to.have.members([ 1, 4, 5, 69, 420 ]);
				});
			});
			
			
			// Category shenanigans
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad000",
				categoryId: "611eba8077f7e14488dad302"
			}).then(() => {
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad000").then(doc => {
					expect(doc?.category, "category should update").to.equal("611eba8077f7e14488dad302");
				});
			});
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad301",
				categoryId: "611eba8077f7e14488dad302"
			}).then(({ errors }) => {
				expect(
					errors.some(err => err.message = "Category doesn't exist or you don't have acces to it"),
					"should return appropriate error when trying to access unowned category"
				).to.be.true;
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad301").then(doc => {
					expect(doc.category, "shouldn't update reminder to unowned category").to.be.null;
				});
			});
			cy.graphQL(UPDATE_REMINDER, {
				id: "611eba8077f7e14488dad001",
				categoryId: "611eba8077f7e14488dad999"
			}).then(({ errors }) => {
				expect(
					errors.some(err => err.message = "Category doesn't exist or you don't have acces to it"),
					"should return appropriate error when trying to access non-existent category"
				).to.be.true;
				cy.task<any>("findDBEntry", "reminders:611eba8077f7e14488dad301").then(doc => {
					expect(doc.category, "shouldn't update reminder to non-existent category").to.be.null;
				});
			});
		});
	});
});