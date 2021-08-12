import { AppProps } from "next/dist/shared/lib/router/router";
import React from "react";

import "../styles/base.css";

const App = ({Component, pageProps}: AppProps) => {
	return <Component {...pageProps} />
}

export default App;