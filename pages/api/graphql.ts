import { getSession } from "@auth0/nextjs-auth0";
import { ApolloServer } from "apollo-server-micro";
import gql from "graphql-tag";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import Database from "../../src/db";
import User from "../../src/models/user";
import GraphQLDate from "graphql-date";

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
			time: String!,
			title: String,
			description: String,
			wholeDay: Boolean,
			notificationOffsets: [Int!]
			categoryId: ID
		): Reminder
		createCategory(
			name: String!,
			icon: String
			expandByDefault: Boolean
		): Category
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
		async createReminder(_, { time, title, description, wholeDay, notificationOffsets, categoryId }, { session }, { fieldNodes }) {
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
			await doc.save().catch(err => { throw new Error(`Failed to save reminder: ${err}`) });
			return doc;
		},
		async createCategory(_, { name, icon, expandByDefault }, { session }, { fieldNodes }) {
			if(!session) throw Error("Not logged in");
			const db = await Database.get();
			const doc = new db.Category({
				name,
				icon,
				expandByDefault,
				owner: User.fromSession(session).id
			});
			await doc.save().catch(err => { throw new Error(`Failed to save category: ${err}`) });
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
