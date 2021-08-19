// Query Stuff

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
}`;

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

// Mutation Stuff
const CREATE_REMINDER = `\
mutation(
	$dueAt: Date!,
	$title: String,
	$description: String,
	$notificationOffsets: [Int!],
	$categoryId: ID
) {
	createReminder(
		dueAt: $dueAt,
		title: $title,
		description: $description,
		notificationOffsets: $notificationOffsets,
		categoryId: $categoryId
	) {
		id
	}
}`;

const REMINDER_GET_PREDETERMINED_FIELDS = `\
query($id: ID!) {
	getReminder(id: $id) {
		dueAt,
		title,
		description,
		wholeDay,
		notificationOffsets,
		category {
			id
		}
		owner
	}
}`

const CREATE_CATEGORY = `\
mutation($name: String!, $icon: String, $expandByDefault: Boolean) {
	createCategory(name: $name, icon: $icon, expandByDefault: $expandByDefault) {
		id
	}
}`;

const CATEGORY_GET_PREDETERMINED_FIELDS = `\
query($id: ID!) {
	getCategory(id: $id) {
		name,
		icon,
		expandByDefault,
		owner
	}
}`

const CATEGORIZE_REMINDER = `\
mutation($reminderId: ID!, $categoryId: ID!) {
	categorizeReminder(reminderId: $reminderId, categoryId: $categoryId) {
		id
	}
}`;

const GET_REMINDER_CATEGORY_ID = `\
query($id: ID!) {
	getReminder(id: $id) {
		category {
			id
		}
	}
}`;

const ADD_NOTIFICATION_OFFSET = `\
mutation($reminderId: ID!, $offset: Int!) {
	addNotificationOffset(reminderId: $reminderId, offset: $offset) {
		id
	}
}`;

const REMOVE_NOTIFICATION_OFFSET = `\
mutation($reminderId: ID!, $offset: Int!) {
	removeNotificationOffset(reminderId: $reminderId, offset: $offset) {
		id
	}
}`;

const SET_NOTIFICATION_OFFSETS = `\
mutation($reminderId: ID!, $offsets: [Int!]!) {
	setNotificationOffsets(reminderId: $reminderId, offsets: $offsets) {
		id
	}
}`;

const GET_REMINDER_NOTIFICATION_OFFSETS = `\
query($id: ID!) {
	getReminder(id: $id) {
		notificationOffsets
	}
}`;

const UPDATE_REMINDER = `\
mutation(
	$id: ID!,
	$title: String,
	$description: String,
	$dueAt: Date,
	$duration: Int,
	$wholeDay: Boolean
) {
	updateReminder(
		id: $id,
		title: $title,
		dueAt: $dueAt,
		duration: $duration,
		wholeDay: $wholeDay
	) {
		id
	}
}`;

const GET_REMINDER_UPDATEABLE_FIELDS = `\
query($id: ID!) {
	getReminder(id: $id) {
		title,
		dueAt,
		duration,
		wholeDay
	}
}`

const UPDATE_CATEGORY = `\
mutation(
	$id: ID!,
	$name: String,
	$icon: String,
	$expandByDefault: Boolean
) {
	updateMutation(
		id: $id,
		name: $name,
		icon: $icon,
		expandByDefault: $expandByDefault
	) {
		id
	}
}`;

const GET_CATEGORY_UPDATEABLE_FIELDS = `\
query($id: ID!) {
	getCategory(id: $id) {
		name,
		icon,
		expandByDefault
	}
}`;

const DELETE_REMINDER = `\
mutation($id: ID!) {
	deleteReminder(id: $id)
}`;

const DELETE_CATEGORY = `\
mutation($id: ID!) {
	deleteCategory(id: $id)
}`

const createTestReminderArgs = {
	dueAt: new Date("2004-08-06T42:04:20.690Z"),
	duration: 60000,
	title: "Test-Created Reminder",
	description: "Reminder created by a test",
	wholeDay: false,
	notificationOffsets: [100, 1000],
	categoryId: "611d4fcfc61d630f488dbfab"
}

const createTestReminderResult = (owner: string) => ({
	owner,
	dueAt: createTestReminderArgs.dueAt.toISOString(),
	duration: createTestReminderArgs.duration,
	title: createTestReminderArgs.title,
	description: createTestReminderArgs.description,
	wholeDay: createTestReminderArgs.wholeDay,
	notificationOffsets: createTestReminderArgs.notificationOffsets,
	category: {
		id: createTestReminderArgs.categoryId
	}
});

const createTestCategoryArgs = {
	name: "Test-Created Category",
	icon: "default",
	expandByDefault: true
}

const createTestCategoryResult = (owner: string) => ({
	owner,
	name: "Test-Created Category",
	icon: "default",
	expandByDefault: true
});

// Tests
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

	it("doesn't allow access to unowned reminders", () => {
		cy.graphQL(GET_REMINDER_BY_ID, {id: "611d515cc61d630f488dbfb7"}).then(({ data }) => {
			expect(data.getReminder).to.be.null;
		});
	});

	it("doesn't allow access to unowned categories", () => {
		cy.graphQL(GET_CATEGORY_BY_ID, {id: "611d4fcfc61d630f488dbfb8"}).then(({ data }) => {
			expect(data.getCategory).to.be.null;
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

	// Mutations
	it("successfully creates new reminders", () => {
		cy.graphQL(CREATE_REMINDER, createTestReminderArgs).then(({ data }) => {
			const { id } = data.getReminder;
			expect(id).to.not.be.null;
			cy.graphQL(REMINDER_GET_PREDETERMINED_FIELDS, { id }).then(({ data }) => {
				expect(data.getReminder).to.deep.equal(createTestReminderResult(Cypress.env("testUserId")));
			});
		});
	});

	it("successfully creates new categories", () => {
		cy.graphQL(CREATE_CATEGORY, createTestCategoryArgs).then(({ data }) => {
			const { id } = data.getCategory;
			expect(id).to.not.be.null;
			cy.graphQL(CATEGORY_GET_PREDETERMINED_FIELDS, { id }).then(({ data }) => {
				expect(data.getCategory).to.deep.equal(createTestCategoryResult(Cypress.env("testUserId")));
			})
		})
	});
})