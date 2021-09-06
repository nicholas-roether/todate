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
			// TODO dynamically change language
			<Html lang="en">
				<Head>
					{/* TODO: PWA & metadata */}
					<link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					/>
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin="anonymous"
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Urbanist:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans+JP:wght@300;500&display=swap"
						rel="stylesheet"
					/>
				</Head>
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
