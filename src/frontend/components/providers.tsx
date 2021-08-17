import { ApolloProvider } from "@apollo/client";
import { UserProvider } from "@auth0/nextjs-auth0";
import React, { PropsWithChildren } from "react";
import apolloClient from "../apollo_client";

const Providers = ({ children }: PropsWithChildren<{}>) => (
	<UserProvider>
		<ApolloProvider client={apolloClient}>
			{children}
		</ApolloProvider>
	</UserProvider>
);

export default Providers;