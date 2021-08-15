import { getSession } from "@auth0/nextjs-auth0";
import { gql, ApolloServer } from "apollo-server-micro";
import { FieldNode } from "graphql";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import Database from "../../src/db";
import User from "../../src/models/user";
import { CategoryDocument } from "../../src/schemas/category";
import { ReminderDocument } from "../../src/schemas/reminder";

const typeDefs = gql`
	type Reminder {
		id: ID!
		title: String!
		description: String!
		updatedAt: String!
		createdAt: String!
		dueAt: String!
		duration: Number!
		wholeDay: Boolean!
		notificationOffsets: [Int!]!
		category: Category
	}

	type Category {
		id: ID!
		name: String!
		content: [Reminder!]!
		icon: String
		expandByDefault: Boolean!
	}

	type UserData {
		reminders: [Reminder!]!
		independentReminders: [Reminder!]!
		categories: [Category!]!
	}

	type Query {
		getReminder(id: ID!): Reminder
		getCategory(id: ID!, remindersFrom: String, remindersTo: String): Category
		getUserData(from: String, to: String): UserData
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

function fieldNodesInclude(nodes: ReadonlyArray<FieldNode>, nodeName: string) {
	return nodes.some(node => node.name.value === nodeName);
}

function docToReminder(doc: ReminderDocument, fieldNodes?: ReadonlyArray<FieldNode>) {
	return {
		id: doc.id,
		title: doc.get("title"),
		description: doc.get("description"),
		updatedAt: (doc.get("updatedAt") as Date).toISOString(),
		createdAt: (doc.get("createdAt") as Date).toISOString(),
		dueAt: (doc.get("dueAt") as Date).toISOString(),
		duration: doc.get("duration"),
		wholeDay: doc.get("wholeDay"),
		notificationOffsets: doc.get("notificationOffsets")
	}
}

async function docToCategory(doc: CategoryDocument, fieldNodes?: ReadonlyArray<FieldNode>, remindersFrom?: Date, remindersTo?: Date) {
	let category: {[key: string]: any} = {
		id: doc.id,
		name: doc.name,
		icon: doc.icon,
		expandByDefault: doc.expandByDefault
	};
	if(fieldNodesInclude(fieldNodes, "content")) category.content = (await doc.findReminders(remindersFrom, remindersTo)).map(rDoc => docToReminder(rDoc));
	return category;
}

const resolvers = {
	Query: {
		async getReminder(_, { id }, { session }, { fieldNodes }) {
			const db = await Database.get();
			const doc = await db.Reminder.findById(id).exec();
			if(!doc || !User.fromSession(session).idMatches(doc.get("owner"))) return null;
			return docToReminder(doc, fieldNodes);
		},
		async getCategory(_, { id, remindersFrom, remindersTo }, { session }, { fieldNodes }) {
			const db = await Database.get();
			const doc = await db.Category.findById(id).exec();
			if(!doc || !User.fromSession(session).idMatches(doc.get("owner"))) return null;
			return docToCategory(doc, fieldNodes, remindersFrom ? new Date(remindersFrom) : null, remindersTo ? new Date(remindersTo) : null);
		},
		async getUserData(_, {from, to}, { session }, { fieldNodes }) {
			if(!session) throw Error("Not logged in");
			const user = User.fromSession(session);
			const db = await Database.get();
			const fromDate = new Date(from);
			const toDate = new Date(to);

			let userData: {[key: string]: any} = {};
			if(fieldNodesInclude(fieldNodes, "categories"))
				userData.categories = await db.Category.find({ owner: user.id }).exec().then(docs => Promise.all(docs.map(doc => docToCategory(doc, null, fromDate, toDate))));
			if(fieldNodesInclude(fieldNodes, "reminders") || fieldNodesInclude(fieldNodes, "independentReminders"))
				userData.reminders = await db.Reminder.find({ owner: user.id }).after(fromDate).before(toDate).exec().then(docs => docs.map(doc => docToReminder(doc)));
			if(fieldNodesInclude(fieldNodes, "independentReminders"))
				userData.independentReminders = userData.reminders.filter(reminder => userData.categories.some(category => category.content.some(r => r.id === reminder.id)));
			return userData;
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
			return docToReminder(doc, fieldNodes);
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
			return docToCategory(doc, fieldNodes);
		}
	}
}

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	context({ req, res }) {
		const session = getSession(req, res);
		return {session};
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
