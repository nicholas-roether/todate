const GET_REMINDER_BY_ID = `\
query($id: ID!) {
	getReminder(id: $id) {
		id,
		title,
		description,
		updatedAt,
		createdAt,
		dueAt,
		duration,
		wholeDay,
		notificationOffsets,
		category {
			id,
			name,
			icon,
			expandByDefault
		}
	}
}`;

const GET_CATEGORY_BY_ID_WITHOUT_CONTENT = `\
query($id: ID!) {
	getCategory(id: $id) {
		id,
		name,
		icon,
		expandByDefault
	}
}`;

const GET_CATEGORY_BY_ID = `\
query($id: ID!) {
	getCategory(id: $id) {
		id,
		name,
		icon,
		expandByDefault,
		content {
			id,
			title,
			description,
			updatedAt,
			createdAt,
			dueAt,
			duration,
			wholeDay,
			notificationOffsets
		}
	}
}`;

const GET_CURRENT_REMINDERS = `\
query($from: Date, $to: Date) {
	getCurrentReminders(from: $from, to: $to) {
		id,
		title,
		description,
		updatedAt,
		createdAt,
		dueAt,
		duration,
		wholeDay,
		notificationOffsets,
		category {
			id,
			name,
			icon,
			expandByDefault
		}
	}
}`;

const GET_REMINDER_HIERARCHY = `\
query($from: Date, $to: Date) {
	getReminderHierarchy(from: $from, to: $to) {
		uncategorized {
			id,
			title,
			description,
			updatedAt,
			createdAt,
			dueAt,
			duration,
			wholeDay,
			notificationOffsets
		},
		categories {
			id,
			name,
			icon,
			expandByDefault,
			content {
				id,
				title,
				description,
				updatedAt,
				createdAt,
				dueAt,
				duration,
				wholeDay,
				notificationOffsets
			}
		}
	}
}`

const testReminder3NoCategory = {
	id: "611d515cc61d630f488dbfb6",
	title: "Test-Reminder #3",
	description: "The third test reminder",
	dueAt: "2021-08-30T18:25:08.331Z",
	createdAt: "2021-07-18T18:25:08.331Z",
	updatedAt: "2021-07-28T18:25:08.331Z",
	duration: 10000,
	wholeDay: false,
	notificationOffsets: [10000, 2000],
};

const testReminder3 = {
	...testReminder3NoCategory,
	category: null
};

const testCategoryNoContent = {
	id: "611d4fcfc61d630f488dbfab",
	name: "Test-Category",
	icon: "default",
	expandByDefault: true
};

const testReminder1NoCategory = {
	id: "611d515cc61d630f488dbfb4",
	title: "Test-Reminder #1",
	description: "The first test reminder",
	dueAt: "2021-08-18T18:25:08.331Z",
	createdAt: "2021-07-18T18:25:08.331Z",
	updatedAt: "2021-07-28T18:25:08.331Z",
	duration: 10000,
	wholeDay: false,
	notificationOffsets: [10000],
};

const testReminder1 = {
	...testReminder1NoCategory,
	category: testCategoryNoContent
};

const testReminder2NoCategory = {
	id: "611d515cc61d630f488dbfb5",
	title: "Test-Reminder #2",
	description: "The second test reminder",
	dueAt: "2021-08-28T18:25:08.331Z",
	createdAt: "2021-07-18T18:25:08.331Z",
	updatedAt: "2021-07-28T18:25:08.331Z",
	duration: 0,
	wholeDay: true,
	notificationOffsets: [],
};

const testReminder2 = {
	...testReminder2NoCategory,
	category: testCategoryNoContent
};

const testCategory = {
	...testCategoryNoContent,
	content: [
		testReminder1NoCategory,
		testReminder2NoCategory
	]
};

describe("The GraphQL Endpoint", () => {
	before(() => {
		cy.task("seedDB");
		cy.login();
	});

	it("successfully loads", () => {
		cy.visit(`/api/graphql`);
	});

	// Queries
	it("correctly gets uncategorized reminders by id", () => {
		cy.graphQL(GET_REMINDER_BY_ID, {id: "611d515cc61d630f488dbfb6"}).then(({ data }) => {
			expect(data.getReminder).to.deep.equal(testReminder3)
		});
	});

	it("correctly gets categories by id without content", () => {
		cy.graphQL(GET_CATEGORY_BY_ID_WITHOUT_CONTENT, {id: "611d4fcfc61d630f488dbfab"}).then(({ data }) => {
			expect(data.getCategory).to.deep.equal(testCategoryNoContent);
		});
	});

	it("correctly gets categorized reminders by id", () => {
		cy.graphQL(GET_REMINDER_BY_ID, {id: "611d515cc61d630f488dbfb4"}).then(({ data }) => {
			expect(data.getReminder).to.deep.equal(testReminder1)
		});
	});

	it("correctly gets categories by id with content", () => {
		cy.graphQL(GET_CATEGORY_BY_ID, {id: "611d4fcfc61d630f488dbfab"}).then(({ data }) => {
			expect(data.getCategory).to.deep.equal(testCategory);
		});
	});

	it("correctly gets current reminders when unbounded", () => {
		cy.graphQL(GET_CURRENT_REMINDERS).then(({ data }) => {
			expect(data.getCurrentReminders).to.deep.equal([
				testReminder1,
				testReminder2,
				testReminder3
			]);
		});
	});

	it("correctly gets current reminders when bounded from below", () => {
		cy.graphQL(GET_CURRENT_REMINDERS, {from: new Date("2021-07-18T18:25:09.331Z")}).then(({ data }) => {
			expect(data.getCurrentReminders).to.deep.equal([
				testReminder1,
				testReminder2,
				testReminder3
			]);
		});
	});

	it("correctly gets current reminders when bounded from above", () => {
		cy.graphQL(GET_CURRENT_REMINDERS, { to: new Date("2021-08-29T18:25:08.331Z")}).then(({ data }) => {
			expect(data.getCurrentReminders).to.deep.equal([
				testReminder1,
				testReminder2
			]);
		});
	});

	it("correctly gets current reminders when bounded from both sides", () => {
		cy.graphQL(GET_CURRENT_REMINDERS, {
			from: new Date("2021-08-18T18:26:08.331Z"),
			to: new Date("2021-08-28T18:28:08.331Z")
		}).then(({ data }) => {
			expect(data.getCurrentReminders).to.deep.equal([testReminder2]);
		});
	});

	it("correctly gets the reminder hierarchy when unbounded", () => {
		cy.graphQL(GET_REMINDER_HIERARCHY).then(({ data }) => {
			expect(data.getReminderHierarchy).to.deep.equal({
				uncategorized: [testReminder3NoCategory],
				categories: [testCategory]
			});
		});
	});

	it("correctly gets the reminder hierarchy when bounded from below", () => {
		cy.graphQL(GET_REMINDER_HIERARCHY, {from: new Date("2021-07-18T18:25:09.331Z")}).then(({ data }) => {
			expect(data.getReminderHierarchy).to.deep.equal({
				uncategorized: [testReminder3NoCategory],
				categories: [testCategory]
			})
		});
	});

	it("correcty gets the reminder hierarchy when bounded from above", () => {
		cy.graphQL(GET_REMINDER_HIERARCHY, { to: new Date("2021-07-18T18:25:09.331Z")}).then(({ data }) => {
			expect(data.getReminderHierarchy).to.deep.equal({
				uncategorized: [],
				categories: []
			})
		});
	});

	it("correctly gets the reminder hierarchy when bounded from both sides", () => {
		cy.graphQL(GET_REMINDER_HIERARCHY, {
			from: new Date("2021-08-18T18:26:08.331Z"),
			to: new Date("2021-08-28T18:28:08.331Z")
		}).then(({ data }) => {
			expect(data.getReminderHierarchy).to.deep.equal({
				uncategorized: [],
				categories: [
					{
						...testCategoryNoContent,
						content: [testReminder2NoCategory]
					}
				]
			})
		});
	});
})