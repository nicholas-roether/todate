import { AppProps } from "next/dist/shared/lib/router/router";
import React from "react";
import Providers from "../src/frontend/components/providers";

import "../styles/base.css";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<Providers>
			<Component {...pageProps} />
		</Providers>
	);
};

export default App;
