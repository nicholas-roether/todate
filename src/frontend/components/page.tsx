import React from "react";
import Head from "next/head";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
	container: {
		background: theme.palette.background.default,
		color: theme.palette.text.primary,
		height: "100vh",
		fontFamily: theme.typography.fontFamily,
		fontSize: theme.typography.fontSize
		// overflow: "hidden"
	}
}));

interface PageProps {
	title?: string;
}

const Page = ({ title, children }: React.PropsWithChildren<PageProps>) => {
	const classes = useStyles();
	return (
		<>
			<Head>
				<title>todate{title ? ` | ${title}` : ""}</title>
			</Head>
			<div className={classes.container}>{children}</div>
		</>
	);
};

export default Page;
