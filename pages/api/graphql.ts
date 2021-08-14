import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { gql, ApolloServer } from "apollo-server-micro";
import { NextApiHandler } from "next";
import ReminderModel from "../../src/models/reminder";

const typeDefs = gql`
	type Reminder {
		id: ID!
		title: String!
		description: String!
		updatedAt: String!
		createdAt: String!
		dueAt: String!
		wholeDay: Boolean!
		notificationOffset: [Int!]!
		category: Category
	}

	type Category {
		id: ID!
		name: String!
		content: [Reminder!]!
	}

	type UserData {
		reminders: [Reminder!]!
		independentReminders: [Reminder!]!
		categories: [Category!]!
	}

	type Query {
		getReminder(id: ID!): Reminder
		# getCategory(id: ID!): Category
		# getUserData: UserData
	}
`;

const resolvers = {
	Query: {
		async getReminder(_, {id}, {session}) {
			const doc = await ReminderModel.findById(id).exec();
			if(doc.get("owner") !== session.idToken) throw Error("Unauthorized");
			if(!doc) return null;
			return {
				id: doc.id,
				title: doc.get("title"),
				description: doc.get("description"),
				updatedAt: (doc.get("updatedAt") as Date).toISOString(),
				createdAt: (doc.get("createdAt") as Date).toISOString(),
				dueAt: (doc.get("dueAt") as Date).toISOString(),
				wholeDay: doc.get("wholeDay"),
				notificationOffset: doc.get("notificationOffset")
			}
		}
	}
}

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	async context({ req, res }) {
		const session = getSession(req, res);
		return {session};
	}
});

const serverStart = apolloServer.start();

const handler: NextApiHandler = withApiAuthRequired(async (req, res) => {
	await serverStart;
	await apolloServer.createHandler({
		path: "/api/graphql"
	})(req, res);
});

export default handler;
