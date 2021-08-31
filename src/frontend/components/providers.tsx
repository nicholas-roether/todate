import { ApolloProvider } from "@apollo/client";
import { UserProvider } from "@auth0/nextjs-auth0";
import { ThemeProvider } from "@material-ui/core";
import React, { PropsWithChildren } from "react";
import apolloClient from "../apollo_client";
import defaultTheme from "../themes/default";

const Providers = ({ children }: PropsWithChildren<{}>) => (
	<UserProvider>
		<ApolloProvider client={apolloClient}>
			<ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
		</ApolloProvider>
	</UserProvider>
);

export default Providers;
