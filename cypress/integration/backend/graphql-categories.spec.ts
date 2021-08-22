import Hashids from "hashids";
import { findInDocMap, gql } from "../../util";

const hashids = new Hashids("todate");

const CATEGORY_EXISTS = gql`
	query($id: ID!) {
		categoryExists(id: $id)
	}
`;

const GET_CATEGORY = gql`
	query(
		$id: ID!,
		$remindersFrom: Date,
		$remindersTo: Date
	) {
		getCategory(
			id: $id,
			remindersFrom: $remindersFrom,
			remindersTo: $remindersTo
		) {
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
`;

const UPDATE_CATEGORY = gql`
	mutation(
		$id: ID!
		$name: String,
		$icon: String,
		$expandByDefault: Boolean
	) {
		updateCategory(
			id: $id,
			name: $name,
			icon: $icon,
			expandByDefault: $expandByDefault
		) {
			id
		}
	}
`;

const CREATE_CATEGORY = gql`
	mutation(
		$id: ID!
		$name: String,
		$icon: String,
		$expandByDefault: String
	) {
		createCategory(
			id: $id,
			name: $name,
			icon: $icon,
			expandByDefault: $expandByDefault
		) {
			id
		}
	}
`;

const DELETE_CATEGORY = gql`
	mutation($id: ID!) {
		deleteCategory(id: $id)
	}
`;

describe("The GraphQL Endpoint (concerning categories)", () => {
	it("correctly reads categories", () => {
		cy.task<seedDB.DocMap>("seedDB", "categoryReadTest").then(docMap => {
			cy.graphQL(CATEGORY_EXISTS, { id: hashids.encodeHex("611eba8077f7e14488dad302") }).then(({ data }) => {
				expect(data.categoryExists, "should return true if category exists").to.be.true;
			});
			cy.graphQL(CATEGORY_EXISTS, { id: hashids.encodeHex("611eba8077f7e14488dad999") }).then(({ data }) => {
				expect(data.categoryExists, "should return false if category doesn't exist").to.be.false;
			});
			cy.graphQL(CATEGORY_EXISTS, { id: hashids.encodeHex("611eba8077f7e14488dad303") }).then(({ data }) => {
				expect(data.categoryExists, "should return false if category isn't owned").to.be.false;
			});
			/**
			 * 	Should correctly get reminders:
			 *  	- All fields should have the same values
			 *  	- Should test cases for returned reminders (w/ a day-long reminder in all of them, and one in none of then):
			 * 			* There is no range given, the test returns all reminders except those that the user doesn't own
			 * 			* The range is restricted from below, and there is a reminder that starts before the restriction,
			 * 			  but extends into it's range; the test returns all reminders in the range except those not owned
			 * 			* The range is restricted from above, and there is a reminder exactly on the restriction; the
			 * 			  test returns all reminders in the range, excluding the one on the restriction.
			 * 			* The range is restricted from both sides, and there is a reminder exactly on the lower
			 * 			  restriction; the test returns all reminders in the range, including the one on the restriction.
			 * 		- Should not get unowned reminders
			 * 		- If the lower restriction is exactly the duration of a reminder after it's due date, it should not be returned.
			 * 
			 * 				0   1   2   3     4   5   6   7     8
			 * 	Test 1:		+   +   *   ^---  *   °   *   *     +
			 * 	Test 2: 	+   +   *   ^-|-  *   °   *   *     +
			 * 	Test 3:		+   +   *   ^---  *   °   *|  *    (+)
			 * 	Test 4:		+   +   *   ^--- |*   °   * | *    (+)
			 * 	Test 5: (test for unowned)
			 * 
			 *  * some reminder  			*--- some reminder w/ a duration
			 *  ^ the basic test reminder	° an unowned reminder
			 *  + a day-long reminder		(+) a day-long reminder outside the range
			 */
			const testCategory = findInDocMap(docMap, "611eba8077f7e14488dad302");
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
				findInDocMap(docMap, "611eba8077f7e14488dad008"),
				findInDocMap(docMap, "611eba8077f7e14488dad009"),
			]
			// Test 1
			cy.graphQL(GET_CATEGORY, { id: hashids.encodeHex(testCategory._id) }).then(({ data }) => {
				const category = data.getCategory;
				expect(category.id, "should return the correct category").to.equal(hashids.encodeHex(testCategory._id));
				expect(category.name, "should correctly return category name").to.equal(testCategory.name);
				expect(category.icon, "should correctly return category icon").to.equal(testCategory.icon);
				expect(category.expandByDefault, "should correctly return expandByDefault from category").to.equal(testCategory.expandByDefault);
				expect(category.content, "content should have correct members").to.deep.equal([
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
					notificationOffsets: doc.notificationOffsets
				})));
			});
			// Test 2
			cy.graphQL(GET_CATEGORY, {
				id: hashids.encodeHex(testCategory._id),
				from: new Date("2021-08-20T10:00:05.000Z")
			}).then(({ data }) => {
				const category = data.getCategory;
				expect(category.content.map(reminder => reminder.id), "should correctly return reminders when bounded from below")
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
			cy.graphQL(GET_CATEGORY, {
				id: hashids.encodeHex(testCategory._id),
				to: new Date("2021-09-20T02:00:00.000Z")
			}).then(({ data }) => {
				const category = data.getCategory;
				expect(category.content.map(reminder => reminder.id), "should correctly return reminders when bounded from above")
					.to.have.members([
						reminders[0],
						reminders[1],
						reminders[5],
						reminders[6]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
			// Test 4
			cy.graphQL(GET_CATEGORY, {
				id: hashids.encodeHex(testCategory._id),
				from: new Date("2021-08-20T10:00:10.000Z"),
				to: new Date("2021-09-20T02:30:00.000Z")
			}).then(({ data }) => {
				const category = data.getCategory;
				expect(category.content.map(reminder => reminder.id), "should correctly return reminders when bounded from above")
					.to.have.members([
						reminders[1],
						reminders[2],
						reminders[3],
						reminders[4],
						reminders[5]
					].map(reminder => hashids.encodeHex(reminder._id)));
			});
			// Test 5
			cy.graphQL(GET_CATEGORY, { id: hashids.encodeHex("611eba8077f7e14488dad303") }).then(({ data }) => {
				expect(data, "should not return unowned categories").to.be.null;
			});
		});
	});

	it("correctly updates categories", () => {
		cy.task<seedDB.DocMap>("seedDB", "categoryUpdateTest").then(docMap => {
			const testUpdate = {
				name: "Updated Category",
				icon: "default",
				expandByDefault: false
			};
			cy.graphQL(UPDATE_CATEGORY, {
				id: hashids.encodeHex("611eba8077f7e14488dad302"),
				...testUpdate
			}).then(() => {
				cy.task<any>("findDBEntry", "categories:611eba8077f7e14488dad302").then(doc => {
					expect(doc.name, "should correctly update name").to.equal(testUpdate.name);
					expect(doc.icon, "should correctly update icon").to.equal(testUpdate.icon);
					expect(doc.expandByDefault, "should correctly update expandByDefault").to.equal(testUpdate.expandByDefault);
				});
			});
			cy.graphQL(UPDATE_CATEGORY, {
				id: hashids.encodeHex("611eba8077f7e14488dad999"),
				...testUpdate
			}).then(({ errors }) => {
				expect(errors.length, "should throw error when trying to update non-existent category").to.be.greaterThan(0);
			});
			const unownedCategory = findInDocMap(docMap, "611eba8077f7e14488dad303");
			cy.graphQL(UPDATE_CATEGORY, {
				id: hashids.encodeHex(unownedCategory._id),
				...testUpdate
			}).then(({ errors }) => {
				expect(errors.length, "should throw error when trying to update unowned category").to.be.greaterThan(0);
				cy.task<any>("findDBEntry", `categories:${unownedCategory._id}`).then(doc => {
					expect(doc, "shouldn't update unowned categories").to.deep.equal(unownedCategory);
				});
			});
		});
	});

	it("correctly deletes categories", () => {
		cy.task<seedDB.DocMap>("seedDB", "categoryDeleteTest").then(docMap => {
			const testCategory = findInDocMap(docMap, "611eba8077f7e14488dad302");
			const unownedCategory = findInDocMap(docMap, "611eba8077f7e14488dad303");
			const testReminders = [
				findInDocMap(docMap, "611eba8077f7e14488dad300"),
				findInDocMap(docMap, "611eba8077f7e14488dad000"),
				findInDocMap(docMap, "611eba8077f7e14488dad001"),
				findInDocMap(docMap, "611eba8077f7e14488dad002")
			]
			cy.graphQL(DELETE_CATEGORY, { id: hashids.encodeHex(testCategory._id) }).then(() => {
				cy.task<any>("findDBEntry", `categories:${testCategory._id}`).then(doc => {
					expect(doc, "should delete category").to.be.null;
				});
				cy.task<any>("findDBEntry", `reminders:${testReminders[0]._id}`).then(doc => {
					expect(doc.category, "should remove deleted category from reminders").to.be.null;
				});
				cy.task<any>("findDBEntry", `reminders:${testReminders[1]._id}`).then(doc => {
					expect(doc.category, "should not affect unrelated reminders").to.equal(testReminders[1].category);
				});
				cy.task<any>("findDBEntry", `reminders:${testReminders[2]._id}`).then(doc => {
					expect(doc.category, "should remove deleted category even from unowned reminders").to.be.null;
				})
			});
			cy.graphQL(DELETE_CATEGORY, { id: hashids.encodeHex(unownedCategory._id) }).then(({ errors }) => {
				expect(errors.length, "should throw an error when trying to delete unowned category").to.be.greaterThan(0);
				cy.task<any>("findDBEntry", `categories:${unownedCategory._id}`).then(doc => {
					expect(doc, "shouldn't delete unowned categories").to.not.be.null;
				});
				cy.task<any>("findDB", `reminders:${testReminders[3]._id}`).then(doc => {
					expect(doc.category, "shouldn't affect reminders when trying to delete unowned categories")
						.to.equal(testReminders[3].category);
				});
			});
		});
	});
});