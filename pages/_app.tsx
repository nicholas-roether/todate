import { UserProvider } from "@auth0/nextjs-auth0";
import { AppProps } from "next/dist/shared/lib/router/router";
import React from "react";

import "../styles/base.css";

const App = ({Component, pageProps}: AppProps) => {
	return <UserProvider><Component {...pageProps} /></UserProvider>
}

export default App;