import { ApolloProvider } from "@apollo/client";
import { UserProvider } from "@auth0/nextjs-auth0";
import { ThemeProvider } from "@material-ui/core";
import React from "react";
import apolloClient from "../apollo_client";
import defaultTheme from "../themes/default";
import IntlManager from "./managers/intl_manager";

const Providers = ({ children }: React.PropsWithChildren<{}>) => (
	<UserProvider>
		<ApolloProvider client={apolloClient}>
			<ThemeProvider theme={defaultTheme}>
				<IntlManager>{children}</IntlManager>
			</ThemeProvider>
		</ApolloProvider>
	</UserProvider>
);

export default Providers;
