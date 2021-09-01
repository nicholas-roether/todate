import { ServerStyleSheets } from "@material-ui/core";
import Document, { Head, Html, Main, NextScript } from "next/document";
import polyfills from "../src/polyfills";
import React from "react";

class MyDocument extends Document {
	public componentDidMount() {
		polyfills();
	}

	render() {
		return (
			<Html>
				<Head>{/* TODO: PWA & metadata */}</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

MyDocument.getInitialProps = async (ctx) => {
	const sheets = new ServerStyleSheets();
	const originalRenderPage = ctx.renderPage;

	try {
		ctx.renderPage = () =>
			originalRenderPage({
				enhanceApp: (App) => (props) =>
					sheets.collect(<App {...props} />)
			});
	} catch (e) {
		console.error(
			"Non-Fatal Error: Material-UI style sheet collection failed."
		);
	}

	const initialProps = await Document.getInitialProps(ctx);

	return {
		...initialProps,
		styles: [
			...React.Children.toArray(initialProps.styles),
			sheets.getStyleElement()
		]
	};
};

export default MyDocument;
