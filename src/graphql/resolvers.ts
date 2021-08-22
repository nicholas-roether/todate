import GraphQLDate from "graphql-date";
import Database from "../db";
import Hashids from "hashids";

// TODO making the salt public kinda defeats the point...
const hashids = new Hashids("todate");

const resolvers = {
	Date: GraphQLDate,
	Reminder: {
		id: parent => hashids.encodeHex(parent.id),
		title: parent => parent.get("title"),
		description: parent => parent.get("description"),
		updatedAt: parent => parent.get("updatedAt"),
		createdAt: parent => parent.get("createdAt"),
		dueAt: parent => parent.get("dueAt"),
		duration: parent => parent.get("duration"),
		wholeDay: parent => parent.get("wholeDay"),
		notificationOffsets: parent => parent.get("notificationOffsets"),
		category: parent => parent.findCategory()
	},
	Category: {
		id: parent => hashids.encodeHex(parent.id),
		name: parent => parent.get("name"),
		icon: parent => parent.get("icon"),
		expandByDefault: parent => parent.get("expandByDefault"),
		async content(parent, _, { from, to }) {
			return parent.findReminders(from, to);
		}
	},
	ReminderHierarchy: {
		async categories(_, __, { user, from, to }) {
			const db = await Database.get();
			const docs = await db.Category.find({ owner: user.id }).exec();
			// TODO make this better, this is terrible
			// Note to future me - this code tries to weed out categories that don't have reminders associated with them within the given time frame.
			// Do do this it makes an individual query for each category requesting all it's reminders within the timeframe...
			return Promise.all(docs.map(async doc => (await db.Reminder.find({ category: doc.id }).after(from).before(to).exec())?.length != 0))
				.then(results => results.map((keep, i) => keep ? docs[i] : null).filter(e => e != null));
		},
		async uncategorized(_, __, { user, from, to }) {
			const db = await Database.get();
			return db.Reminder.find({ owner: user.id, category: null }).after(from).before(to).exec();
		}
	},
	Query: {
		async reminderExists(_, { id }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(hashids.decodeHex(id)).where("owner").equals(user.id).exec();
			return Boolean(doc);
		},
		async categoryExists(_, { id }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(hashids.decodeHex(id)).where("owner").equals(user.id).exec();
			return Boolean(doc);
		},
		async getReminder(_, { id }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(hashids.decodeHex(id)).exec();
			if(!doc || !user.idMatches(doc.owner)) return null;
			return doc;
		},
		async getCategory(_, { id, remindersFrom, remindersTo }, session) {
			if(!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(hashids.decodeHex(id)).exec();
			if(!doc || !session.user.idMatches(doc.owner)) return null;
			session.from = remindersFrom;
			session.to = remindersTo;
			return doc;
		},
		async getCurrentReminders(_, { from, to }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			return db.Reminder.find({ owner: user.id }).after(from).before(to).exec();
		},
		async getReminderHierarchy(_, { from, to }, session) {
			if(!session) throw Error("Not logged in");
			session.from = from;
			session.to = to;
			return {} // All the getting is handled by child resolvers
		}
	},
	Mutation: {
		async createReminder(_, { dueAt, duration, title, description, wholeDay, notificationOffsets, categoryId }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			categoryId = hashids.decodeHex(categoryId);
			const validCategory = await db.Category.exists({ _id: categoryId, owner: user.id });
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
		async createCategory(_, { name, icon, expandByDefault }, { user }) {
			if(!user) throw Error("Not logged in");
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
		async updateReminder(_, {
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

		}, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(hashids.decodeHex(id)).exec();
			if(!doc || !user.idMatches(doc.owner)) throw Error("Reminder does not exist or you don't have access to it");
			if(categoryId) {
				const decoded = hashids.decodeHex(categoryId);
				if(!(await db.Category.exists({ _id: decoded, owner: user.id }))) throw Error("Category does not exist or you don't have access to it");
				doc.category = decoded;
			}
			if(title) doc.title = title;
			if(description) doc.description = description;
			if(dueAt) doc.dueAt = dueAt;
			if(duration) doc.duration = duration;
			if(wholeDay) doc.wholeDay = wholeDay;
			if(notificationOffsets) doc.notificationOffsets = notificationOffsets;
			if(addNotificationOffsets) {
				addNotificationOffsets.forEach(offset => {
					if(doc.notificationOffsets.includes(offset)) return;
					doc.notificationOffsets.push(offset);
				});
			}
			if(removeNotificationOffsets) {
				removeNotificationOffsets.forEach(offset => {
					while(doc.notificationOffsets.includes(offset))
						doc.notificationOffsets.splice(doc.notificationOffsets.indexOf(offset), 1);
				});
			}
			await doc.save();
			return doc;
		},
		async updateCategory(_, {
			id,
			name,
			icon,
			expandByDefault
		}, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(hashids.decodeHex(id)).exec();
			if(!doc || !user.idMatches(doc.owner)) throw Error("Category does not exist or you don't have access to it");
			if(name) doc.name = name;
			if(icon) doc.icon = icon;
			if(expandByDefault) doc.expandByDefault = expandByDefault;
			await doc.save();
			return doc;
		},
		async deleteReminder(_, { id }, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(hashids.decodeHex(id)).exec();
			if(!doc || !user.idMatches(doc.owner)) throw Error("Reminder does not exist or you don't have access to it");
			await doc.delete();
			return id;
		},
		async deleteCategory(_, { id }, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(hashids.decodeHex(id)).exec();
			if(!doc || !user.idMatches(doc.owner)) throw Error("Category does not exist or you don't have access to it");
			await doc.delete();
			return id;
		}
	}
};

export default resolvers;