import GraphQLDate from "graphql-date";
import Database from "../db";

const resolvers = {
	Date: GraphQLDate,
	Reminder: {
		id: parent => parent.id,
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
		id: parent => parent.id,
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
			return Promise.all(docs.map(async doc => (await db.Reminder.find({ category: doc.id }).after(from).before(to).exec())?.length != 0))
				.then(results => results.map((keep, i) => keep ? docs[i] : null).filter(e => e != null));
		},
		async uncategorized(_, __, { user, from, to }) {
			const db = await Database.get();
			return db.Reminder.find({ owner: user.id, category: null }).after(from).before(to).exec();
		}
	},
	Query: {
		async getReminder(_, { id }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(id).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) return null;
			return doc;
		},
		async getCategory(_, { id, remindersFrom, remindersTo }, session) {
			if(!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(id).exec();
			if(!doc || !session.user.idMatches(doc.get("owner"))) return null;
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
		async categorizeReminder(_, { reminderId, categoryId }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			if(!(await db.Category.exists({ _id: categoryId, owner: user.id }))) throw Error("Category does not exist or you don't have access to it");
			const doc = await db.Reminder.findById(reminderId).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			doc.set("category", categoryId);
			await doc.save();
			return doc;
		},
		async addNotificationOffset(_, { reminderId, offset }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(reminderId).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			if(doc.get("notificationOffsets").includes(offset)) return doc;
			doc.get("notificationOffsets").push(offset);
			await doc.save();
			return doc;
		},
		async removeNotificationOffset(_, { reminderId, offset }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(reminderId).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			const offsets = doc.get("notificationOffsets");
			while(offsets.includes(offset)) offsets.splice(offsets.firstIndexOf(offset), 1);
			doc.set("notificationOffsets", offsets);
			await doc.save();
			return doc;
		},
		async setNotificationOffsets(_, { reminderId, offsets }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(reminderId).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			doc.set("notificationOffsets", offsets);
			await doc.save();
			return doc;
		},
		async updateReminder(_, {
			id,
			title,
			description,
			dueAt,
			duration,
			wholeDay
		}, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(id).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			if(title) doc.set("title", title);
			if(description) doc.set("description", description);
			if(dueAt) doc.set("dueAt", dueAt);
			if(duration) doc.set("duration", duration);
			if(wholeDay) doc.set("wholeDay", wholeDay);
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
			const doc = await db.Category.findById(id).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Category does not exist or you don't have access to it");
			if(name) doc.set("name", name);
			if(icon) doc.set("icon", icon);
			if(expandByDefault) doc.set("expandByDefault", expandByDefault);
			await doc.save();
			return doc;
		},
		async deleteReminder(_, { id }, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Reminder.findById(id).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Reminder does not exist or you don't have access to it");
			await doc.delete();
			return id;
		},
		async deleteCategory(_, { id }, { user }) {
			if(!user) throw new Error("Not logged in");
			const db = await Database.get();
			const doc = await db.Category.findById(id).exec();
			if(!doc || !user.idMatches(doc.get("owner"))) throw Error("Category does not exist or you don't have access to it");
			await doc.delete();
			return id;
		}
	}
};

export default resolvers;