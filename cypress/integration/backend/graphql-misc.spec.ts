import Hashids from "hashids";
import { findInDocMap, gql } from "../../util";

const hashids = new Hashids("todate");

const GET_CURRENT_REMINDERS = gql`
	query($from: Date, $to: Date) {
		getCurrentReminders(from: $from, to: $to) {
			id
			title
			description
			updatedAt
			createdAt
			dueAt
			duration
			wholeDay
			notificationOffsets
			category {
				id
				name
				icon
				expandByDefault
			}
		}
	}
`;

const GET_REMINDER_HIERARCHY = gql`
	query($from: Date, $to: Date) {
		getReminderHierarchy(from: $from, to: $to) {
			uncategorized {
				id
				title
				description
				updatedAt
				createdAt
				dueAt
				duration
				wholeDay
				notificationOffsets
				category
			}
			categories {
				id
				name
				icon
				expandByDefault
				content  {
					id
					title
					description
					updatedAt
					createdAt
					dueAt
					duration
					wholeDay
					notificationOffsets
					category
				}
			}
		}
	}
`;

describe("The GraphQL Endpoint (concerning misc queries)", () => {
	it("correctly gets current reminders", () => {
		/**
		 *  Cases to check:
		 * 		- No restriction
		 * 			* should get all reminders correctly
		 * 			* shouldn't return unowned reminders
		 * 		- Restricted from below
		 * 			* should return the correct reminders
		 * 			* should return reminders that don't start after the restriction
		 * 			  but extend into it
		 * 			* should return reminders that end exactly on the lower restriction
		 * 		- Restricted from above
		 * 			* should return the correct reminders
		 * 			* shouldn't return reminders that begin exactly on the upper restriction
		 * 		- Restricted from both sides
		 * 			* should return the correct reminders
		 *  Other notes:
		 * 		- Should return day-long reminders within the range
		 * 			* day-long reminder's ranges should always be treated as starting
		 * 			  on the start of the day
		 * 
		 * 	 
		 */
		 cy.task<seedDB.DocMap>("seedDB", "currentReminderTest").then(docMap => {
			const reminders = [
				findInDocMap(docMap, "611eba8077f7e14488dad000"),
				findInDocMap(docMap, "611eba8077f7e14488dad001"),
				findInDocMap(docMap, "611eba8077f7e14488dad002"),
				findInDocMap(docMap, "611eba8077f7e14488dad300"),
				findInDocMap(docMap, "611eba8077f7e14488dad003"),
				findInDocMap(docMap, "611eba8077f7e14488dad004"),
				findInDocMap(docMap, "611eba8077f7e14488dad005"),
				findInDocMap(docMap, "611eba8077f7e14488dad006"),
				findInDocMap(docMap, "611eba8077f7e14488dad007"),
			];
			const testCategory = findInDocMap(docMap, "611eba8077f7e14488dad302");
			// Test 1
			cy.graphQL(GET_CURRENT_REMINDERS).then(({ data }) => {
				const currentReminders = data.getCurrentReminders;
				expect(currentReminders, "should return reminders correctly").to.deep.equal([
					reminders[0],
					reminders[1],
					reminders[2],
					reminders[3],
					reminders[4],
					reminders[6],
					reminders[7],
					reminders[8]
				].map(doc => ({
					id: hashids.encodeHex(doc._id),
					title: doc.title,
					description: doc.description,
					updatedAt: doc.updatedAt,
					createdAt: doc.createdAt,
					dueAt: doc.dueAt,
					duration: doc.duration,
					wholeDay: doc.wholeDay,
					notificationOffsets: doc.notificationOffsets,
					category: {
						id: hashids.encodeHex(testCategory._id),
						name: testCategory.name,
						icon: testCategory.icon,
						expandByDefault: testCategory.expandByDefault
					}
				})));
			});
			// Test 2
			cy.graphQL(GET_CURRENT_REMINDERS, { from: new Date("2021-08-20T10:00:05.000Z") }).then(({ data }) => {
				const currentReminders = data.getCurrentReminders;
				expect(currentReminders.map(reminder => reminder.id), "should correctly return reminders when bounded from below")
					.to.have.members([
						reminders[0],
						reminders[1],
						reminders[3],
						reminders[4],
						reminders[6],
						reminders[7],
						reminders[8]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
			// Test 3
			cy.graphQL(GET_CURRENT_REMINDERS, { to: new Date("2021-09-20T02:00:00.000Z") }).then(({ data }) => {
				const currentReminders = data.getCurrentReminders;
				expect(currentReminders.map(reminder => reminder.id), "should correctly return reminders when bounded from above")
					.to.have.members([
						reminders[0],
						reminders[1],
						reminders[5],
						reminders[6]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
			// Test 4
			cy.graphQL(GET_CURRENT_REMINDERS, {
				from: new Date("2021-08-20T10:00:10.000Z"),
				to: new Date("2021-09-20T02:30:00.000Z")
			}).then(({ data }) => {
				const currentReminders = data.getCurrentReminders;
				expect(currentReminders.map(reminder => reminder.id), "should correctly return reminders when bounded from both sides")
					.to.have.members([
						reminders[1],
						reminders[2],
						reminders[3],
						reminders[4],
						reminders[5]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
			// Test 5
			cy.graphQL(GET_CURRENT_REMINDERS, {
				id: hashids.encodeHex(testCategory._id),
				from: new Date("2021-08-21T00:00:00.000Z")
			}).then(({ data }) => {
				const currentReminders = data.getCurrentReminders;
				expect(currentReminders.map(reminder => reminder.id), "should correctly handle day-long reminders w/ weird dueAt values")
					.to.have.members([
						reminders[6],
						reminders[7],
						reminders[8]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
		});
	});

	it("correctly gets the reminder hierarchy", () => {
		/** 
		 * 	Cases to check:
		 * 		- All from above
		 * 	Other notes:
		 * 		- All from above
		 * 		- Should correctly assign reminders to categories
		 * 		- Should return reminders associated with unowned categories
		 * 		  as uncategorized; shouldn't return unowned categories
		 * 
		 *  => Use same reminders & tests from prev test, categorize some of them into testReminder,
		 * 	   some into unownedReminder
		 */
	});
});