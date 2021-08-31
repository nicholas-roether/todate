import { getSession } from "@auth0/nextjs-auth0";
import { ApolloServer } from "apollo-server-micro";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import User from "../models/user";
import resolvers from "./resolvers";

import typeDefs from "./typedefs.graphql";

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
	context({ req, res }) {
		const session = getSession(req, res);
		if (!session)
			throw new Error(
				"Failed to start Apollo server: Couldn't get session"
			);
		return {
			session,
			user: User.fromSession(session)
		};
	}
});

const handleGraphQL: () => NextApiHandler = () => {
	const handlerPromise = apolloServer
		.start()
		.then(() => apolloServer.createHandler({ path: "/api/graphql" }));

	return async (req, res) => {
		const handler = await handlerPromise;
		await NextCors(req, res, {
			methods: ["GET", "POST", "OPTIONS", "HEAD"],
			origin: "https://studio.apollographql.com",
			credentials: true
		});
		await handler(req, res);
	};
};

export default handleGraphQL;
