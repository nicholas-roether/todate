import GraphQLDate from "graphql-date";
import Database from "../db";
import Hashids from "hashids";
import { ReminderDocument } from "../schemas/reminder";
import { CategoryDocument } from "../schemas/category";

// TODO making the salt public kinda defeats the point...
const hashids = new Hashids("todate");

type ArgMap = { [key: string]: any };

const resolvers = {
	Date: GraphQLDate,
	Reminder: {
		id: (parent: ReminderDocument) => hashids.encodeHex(parent.id),
		title: (parent: ReminderDocument) => parent.title,
		description: (parent: ReminderDocument) => parent.description,
		updatedAt: (parent: ReminderDocument) => parent.updatedAt,
		createdAt: (parent: ReminderDocument) => parent.createdAt,
		dueAt: (parent: ReminderDocument) => parent.dueAt,
		duration: (parent: ReminderDocument) => parent.duration,
		wholeDay: (parent: ReminderDocument) => parent.wholeDay,
		notificationOffsets: (parent: ReminderDocument) =>
			parent.notificationOffsets,
		category: (parent: ReminderDocument) => parent.findCategory()
	},
	Category: {
		id: (parent: CategoryDocument) => hashids.encodeHex(parent.id),
		name: (parent: CategoryDocument) => parent.name,
		icon: (parent: CategoryDocument) => parent.icon,
		expandByDefault: (parent: CategoryDocument) => parent.expandByDefault,
		async content(parent: CategoryDocument, _: any, { from, to }: ArgMap) {
			return parent.findReminders(from, to);
		}
	},
	ReminderHierarchy: {
		async categories(_: any, __: any, { user, from, to }: ArgMap) {
			const db = await Database.get();
			const docs = await db.Category.find({ owner: user.id }).exec();
			// TODO make this better, this is terrible
			// Note to future me - this code tries to weed out categories that don't have reminders associated with them within the given time frame.
			// Do do this it makes an individual query for each category requesting all it's reminders within the timeframe...
			return Promise.all(
				docs.map(
					async (doc) =>
						(
							await db.Reminder.find({ category: doc.id })
								.after(from)
								.before(to)
								.exec()
						)?.length != 0
				)
			).then((results) =>
				results
					.map((keep, i) => (keep ? docs[i] : null))
					.filter((e) => e != null)
			);
		},
		async uncategorized(_: any, __: any, { user, from, to }: ArgMap) {
			const db = await Database.get();
			return db.Reminder.find({ owner: user.id, category: null })
				.after(from)
				.before(to)
				.exec();
		}
	},
	Query: {
		async reminderExists(_: any, { id }: ArgMap, { user }: ArgMap) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(hashids.decodeHex(id))
				.where("owner")
				.equals(user.id)
				.exec();
			return Boolean(doc);
		},
		async categoryExists(_: any, { id }: ArgMap, { user }: ArgMap) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(hashids.decodeHex(id))
				.where("owner")
				.equals(user.id)
				.exec();
			return Boolean(doc);
		},
		async getReminder(_: any, { id }: ArgMap, { user }: ArgMap) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(
				hashids.decodeHex(id)
			).exec();
			if (!doc || !user.idMatches(doc.owner)) return null;
			return doc;
		},
		async getCategory(
			_: any,
			{ id, remindersFrom, remindersTo }: ArgMap,
			session: ArgMap
		) {
			if (!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(
				hashids.decodeHex(id)
			).exec();
			if (!doc || !session.user.idMatches(doc.owner)) return null;
			session.from = remindersFrom;
			session.to = remindersTo;
			return doc;
		},
		async getCurrentReminders(
			_: any,
			{ from, to }: ArgMap,
			{ user }: ArgMap
		) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			return db.Reminder.find({ owner: user.id })
				.after(from)
				.before(to)
				.exec();
		},
		async getReminderHierarchy(
			_: any,
			{ from, to }: ArgMap,
			session: ArgMap
		) {
			if (!session) throw Error("Not logged in");
			session.from = from;
			session.to = to;
			return {}; // All the getting is handled by child resolvers
		}
	},
	Mutation: {
		async createReminder(
			_: any,
			{
				dueAt,
				duration,
				title,
				description,
				wholeDay,
				notificationOffsets,
				categoryId
			}: ArgMap,
			{ user }: ArgMap
		) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			categoryId = hashids.decodeHex(categoryId);
			const validCategory = await db.Category.exists({
				_id: categoryId,
				owner: user.id
			});
			const doc = new db.Reminder({
				dueAt,
				duration,
				title,
				description,
				wholeDay,
				notificationOffsets,
				category: validCategory ? categoryId : null,
				owner: user.id
			});
			await doc.save();
			return doc;
		},
		async createCategory(
			_: any,
			{ name, icon, expandByDefault }: ArgMap,
			{ user }: ArgMap
		) {
			if (!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = new db.Category({
				name,
				icon,
				expandByDefault,
				owner: user.id
			});
			await doc.save();
			return doc;
		},
		async updateReminder(
			_: any,
			{
				id,
				title,
				description,
				dueAt,
				duration,
				wholeDay,
				categoryId,
				notificationOffsets,
				addNotificationOffsets,
				removeNotificationOffsets
			}: ArgMap,
			{ user }: ArgMap
		) {
			if (!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(
				hashids.decodeHex(id)
			).exec();
			if (!doc || !user.idMatches(doc.owner))
				throw Error(
					"Reminder does not exist or you don't have access to it"
				);
			if (categoryId) {
				const decoded = hashids.decodeHex(categoryId);
				if (
					!(await db.Category.exists({
						_id: decoded,
						owner: user.id
					}))
				)
					throw Error(
						"Category does not exist or you don't have access to it"
					);
				doc.category = decoded;
			}
			if (title) doc.title = title;
			if (description) doc.description = description;
			if (dueAt) doc.dueAt = dueAt;
			if (duration) doc.duration = duration;
			if (wholeDay) doc.wholeDay = wholeDay;
			if (notificationOffsets)
				doc.notificationOffsets = notificationOffsets;
			if (addNotificationOffsets) {
				addNotificationOffsets.forEach((offset: number) => {
					if (doc.notificationOffsets.includes(offset)) return;
					doc.notificationOffsets.push(offset);
				});
			}
			if (removeNotificationOffsets) {
				removeNotificationOffsets.forEach((offset: number) => {
					while (doc.notificationOffsets.includes(offset))
						doc.notificationOffsets.splice(
							doc.notificationOffsets.indexOf(offset),
							1
						);
				});
			}
			await doc.save();
			return doc;
		},
		async updateCategory(
			_: any,
			{ id, name, icon, expandByDefault }: ArgMap,
			{ user }: ArgMap
		) {
			if (!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(
				hashids.decodeHex(id)
			).exec();
			if (!doc || !user.idMatches(doc.owner))
				throw Error(
					"Category does not exist or you don't have access to it"
				);
			if (name) doc.name = name;
			if (icon) doc.icon = icon;
			if (expandByDefault !== null) doc.expandByDefault = expandByDefault;
			await doc.save();
			return doc;
		},
		async deleteReminder(_: any, { id }: ArgMap, { user }: ArgMap) {
			if (!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(
				hashids.decodeHex(id)
			).exec();
			if (!doc || !user.idMatches(doc.owner))
				throw Error(
					"Reminder does not exist or you don't have access to it"
				);
			await doc.delete();
			return id;
		},
		async deleteCategory(_: any, { id }: ArgMap, { user }: ArgMap) {
			if (!user) throw new Error("Not logged in");
			const db = await Database.get();
			const decodedId = hashids.decodeHex(id);
			const doc = await db.Category.findById(decodedId).exec();
			if (!doc || !user.idMatches(doc.owner))
				throw Error(
					"Category does not exist or you don't have access to it"
				);
			await doc.delete();
			await db.Reminder.updateMany(
				{ category: decodedId },
				{ category: undefined }
			);
			return id;
		}
	}
};

export default resolvers;
