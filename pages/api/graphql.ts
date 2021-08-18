import { getSession } from "@auth0/nextjs-auth0";
import { ApolloServer } from "apollo-server-micro";
import gql from "graphql-tag";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import Database from "../../src/db";
import User from "../../src/models/user";
import GraphQLDate from "graphql-date";

// TODO relocate this code

const typeDefs = gql`
	scalar Date

	type Reminder {
		id: ID!
		title: String!
		description: String!
		updatedAt: Date!
		createdAt: Date!
		dueAt: Date!
		duration: Int!
		wholeDay: Boolean!
		notificationOffsets: [Int!]!
		category: Category
	}

	type Category {
		id: ID!
		name: String!
		content(from: Date, to: Date): [Reminder!]!
		icon: String
		expandByDefault: Boolean!
	}

	type ReminderHierarchy {
		uncategorized: [Reminder!]!
		categories: [Category!]!
	}

	type Query {
		getReminder(id: ID!): Reminder
		getCategory(id: ID!, remindersFrom: Date, remindersTo: Date): Category
		getCurrentReminders(from: Date, to: Date): [Reminder!]!
		getReminderHierarchy(from: Date, to: Date): ReminderHierarchy!
	}

	type Mutation {
		createReminder(
			time: String!
			title: String
			description: String
			wholeDay: Boolean
			notificationOffsets: [Int!]
			categoryId: ID
		): Reminder!
		createCategory(
			name: String!
			icon: String
			expandByDefault: Boolean
		): Category!,
		categorizeReminder(
			reminderId: ID!
			categoryId: ID!
		): Reminder!
		addNotificationOffset(
			reminderId: ID!
			offset: Int!
		): Reminder!
		removeNotificationOffset(
			reminderId: ID!
			offset: Int!
		): Reminder!
		setNotificationOffsets(
			reminder: ID!
			offsets: [Int!]!
		): Reminder!
		updateReminder(
			id: ID!
			title: String
			description: String
			dueAt: Date
			duration: Int
			wholeDay: Boolean
		): Reminder!
		updateCategory(
			id: ID!,
			name: String,
			icon: String,
			expandByDefault: Boolean
		)
	}
`;

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
		notificationOffsets: parent => parent.get("notificationOffsets")
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
		async categories(_, __, { user }) {
			const db = await Database.get();
			return db.Category.find({ owner: user.id }).exec();
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
		}
	},
	Mutation: {
		async createReminder(_, { time, title, description, wholeDay, notificationOffsets, categoryId }, { session }) {
			if(!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = new db.Reminder({
				dueAt: time,
				title,
				description,
				wholeDay,
				notificationOffsets,
				category: categoryId,
				owner: User.fromSession(session).id
			});
			await doc.save();
			return doc;
		},
		async createCategory(_, { name, icon, expandByDefault }, { session }) {
			if(!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = new db.Category({
				name,
				icon,
				expandByDefault,
				owner: User.fromSession(session).id
			});
			await doc.save();
			return doc;
		},
		async categorizeReminder(_, { reminderId, categoryId }, { user }) {
			if(!user) throw Error("Not logged in");
			const db = await Database.get();
			if(!(await db.Category.exists({ _id: categoryId}))) throw Error("Category doesn't exist");
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
		}
	}
}

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	context({ req, res }) {
		const session = getSession(req, res);
		return { 
			session,
			user: User.fromSession(session)
		};
	}
});


const serverStart = apolloServer.start();

const handler: NextApiHandler = async (req, res) => {
	await serverStart;
	await NextCors(req, res, {
		methods: ["GET", "POST", "OPTIONS", "HEAD"],
		origin: "https://studio.apollographql.com",
		credentials: true
	});
	await apolloServer.createHandler({
		path: "/api/graphql"
	})(req, res);
};

export const config = {
	api: {
		bodyParser: false
	}
}

export default handler;
