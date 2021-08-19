const REMINDER_EXISTS = `\
query($id: ID!) {
	reminderExists(id: $id)
}`

const CATEGORY_EXISTS = `\
query($id: ID!) {
	categoryExists(id: $id)
}`

const CREATE_REMINDER = `\
mutation(
	$dueAt: Date!,
	$duration: Int
	$title: String,
	$description: String,
	$notificationOffsets: [Int!],
	$categoryId: ID
) {
	createReminder(
		dueAt: $dueAt,
		duration: $duration,
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
		duration,
		title,
		description,
		wholeDay,
		notificationOffsets,
		category {
			id
		}
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
		expandByDefault
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
		description: $description
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
		description
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
	dueAt: new Date("2004-08-06T12:04:20.690Z"),
	duration: 60000,
	title: "Test-Created Reminder",
	description: "Reminder created by a test",
	wholeDay: false,
	notificationOffsets: [100, 1000],
	categoryId: "611d4fcfc61d630f488dbfc1"
}

const createTestReminderResult = {
	dueAt: createTestReminderArgs.dueAt.toISOString(),
	duration: createTestReminderArgs.duration,
	title: createTestReminderArgs.title,
	description: createTestReminderArgs.description,
	wholeDay: createTestReminderArgs.wholeDay,
	notificationOffsets: createTestReminderArgs.notificationOffsets,
	category: {
		id: createTestReminderArgs.categoryId
	}
};

const createTestCategoryArgs = {
	name: "Test-Created Category",
	icon: "default",
	expandByDefault: true
}

const createTestCategoryResult = {
	name: "Test-Created Category",
	icon: "default",
	expandByDefault: true
};

const updateReminderTestArgs = {
	id: "611d515cc61d630f488dbfc2",
	title: "Updated Reminder",
	description: "This reminder has been updated",
	dueAt: new Date("2021-09-18T18:25:08.331Z"),
	duration: 0,
	wholeDay: true
}

const updateReminderTestResponse = {
	title: updateReminderTestArgs.title,
	description: updateReminderTestArgs.description,
	dueAt: updateReminderTestArgs.dueAt.toISOString(),
	duration: updateReminderTestArgs.duration,
	wholeDay: updateReminderTestArgs.wholeDay
}

const updateCategoryTestArgs = {
	id: "611d4fcfc61d630f488dbfc3",
	name: "Updated Category",
	icon: "appointment",
	expandByDefault: false
}

const updateCategoryTestResponse = {
	name: updateCategoryTestArgs.name,
	icon: updateCategoryTestArgs.icon,
	expandByDefault: updateCategoryTestArgs.expandByDefault
}

describe("A mutation using the GraphQL Endpoint", () => {
	before(() => {
		cy.login();
	});

	beforeEach(() => {
		cy.task("seedDB:mutations");
	})

	it("successfully creates new reminders", () => {
		cy.graphQL(CREATE_REMINDER, createTestReminderArgs).then(({ data }) => {
			const { id } = data.createReminder;
			expect(id).to.not.be.null;
			cy.graphQL(REMINDER_GET_PREDETERMINED_FIELDS, { id }).then(({ data }) => {
				expect(data.getReminder).to.deep.equal(createTestReminderResult);
			});
		});
	});

	it("successfully creates new categories", () => {
		cy.graphQL(CREATE_CATEGORY, createTestCategoryArgs).then(({ data }) => {
			const { id } = data.createCategory;
			expect(id).to.not.be.null;
			cy.graphQL(CATEGORY_GET_PREDETERMINED_FIELDS, { id }).then(({ data }) => {
				expect(data.getCategory).to.deep.equal(createTestCategoryResult);
			});
		});
	});

	it("successfully recategorizes reminders", () => {
		cy.graphQL(CATEGORIZE_REMINDER, {
			reminderId: "611d515cc61d630f488dbfb9",
			categoryId: "611d4fcfc61d630f488dbfc1"
		}).then(({ data }) => {
			const { id } = data.categorizeReminder;
			cy.graphQL(GET_REMINDER_CATEGORY_ID, { id }).then(({ data }) => {
				expect(data.getReminder.category.id).to.equal("611d4fcfc61d630f488dbfc1");
			});
		});
	});

	it("successfully adds notification offsets", () => {
		cy.graphQL(ADD_NOTIFICATION_OFFSET, {
			id: "611d515cc61d630f488dbfb9",
			offset: 30000
		}).then(({ data }) => {
			const { id } = data.addNotificationOffset;
			cy.graphQL(GET_REMINDER_NOTIFICATION_OFFSETS, { id }).then(({ data }) => {
				expect(data.getReminder.notificationOffets).to.contain(30000);
			});
		});
	});

	it("successfully removes notification offsets", () => {
		cy.graphQL(REMOVE_NOTIFICATION_OFFSET, {
			id: "611d515cc61d630f488dbfb9",
			offset: 20000
		}).then(({ data }) => {
			const { id } = data.removeNotificationOffset;
			cy.graphQL(GET_REMINDER_NOTIFICATION_OFFSETS, { id }).then(({ data }) => {
				expect(data.getReminder.notificationOffets).to.not.contain(20000);
			});
		});
	});

	it("successfully sets notification offsets", () => {
		cy.graphQL(SET_NOTIFICATION_OFFSETS, {
			id: "611d515cc61d630f488dbfb9",
			offsets: [69, 420]
		}).then(({ data }) => {
			const { id } = data.setNotificationOffsets;
			cy.graphQL(GET_REMINDER_NOTIFICATION_OFFSETS, { id }).then(({ data }) => {
				expect(data.getReminder.notificationOffets).to.have.all.members([69, 420]);
			});
		});
	});

	it("successfully updates reminders", () => {
		cy.graphQL(UPDATE_REMINDER, updateReminderTestArgs).then(({ data }) => {
			const { id } = data.updateReminder;
			cy.graphQL(GET_REMINDER_UPDATEABLE_FIELDS, { id }).then(({ data }) => {
				expect(data.getReminder).to.deep.equal(updateReminderTestResponse);
			});
		});
	});

	it("successfully updates categories", () => {
		cy.graphQL(UPDATE_CATEGORY, updateCategoryTestArgs).then(({ data }) => {
			const { id } = data.updateCategory;
			cy.graphQL(GET_CATEGORY_UPDATEABLE_FIELDS, { id }).then(({ data }) => {
				expect(data.getCategory).to.deep.equal(updateCategoryTestResponse);
			});
		});
	});

	it("successfully deletes reminders", () => {
		cy.graphQL(DELETE_REMINDER, { id: "611d515cc61d630f488dbfc5"}).then(({ data }) => {
			const { id } = data.deleteReminder;
			cy.graphQL(REMINDER_EXISTS, { id }).then(({ data}) => {
				expect(data.reminderExists).to.be.false;
			});
		});
	});

	it("successfully deletes categories", () => {
		cy.graphQL(DELETE_CATEGORY, { id: "611d4fcfc61d630f488dbfc4"}).then(({ data }) => {
			const { id } = data.deleteCategory;
			cy.graphQL(CATEGORY_EXISTS, { id }).then(({ data}) => {
				expect(data.categoryExists).to.be.false;
			});
		});
	});
});