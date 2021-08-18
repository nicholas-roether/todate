import { useQuery } from "@apollo/client";
import { useUser } from "@auth0/nextjs-auth0";
import { Box, Button, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import gql from "graphql-tag";
import React from "react";
import { today, tomorrow } from "../src/util";

const useStyles = makeStyles(theme => ({
	tableContainer: {
		width: "650px",
		margin: theme.spacing(4, 2)
	},
	table: {
		width: "650px"
	}
}));

// TODO export queries to own file
const GET_USER_REMINDERS_QUERY = gql`
	query GetUserReminders($from: Date, $to: Date) {
		getCurrentReminders(from: $from, to: $to) {
			id,
			title,
			description,
			dueAt,
			duration,
			wholeDay,
			category {
				id,
				name,
				icon
			}
		}
	}
`;

const Index = () => {
	const { user, error: userError, isLoading: userIsLoading } = useUser();
	const { data: reminderData, error: reminderError, loading: reminderLoading } = useQuery(GET_USER_REMINDERS_QUERY, {
		variables: {
			// from: today().getTime(),
			// to: tomorrow().getTime() - 1
		}
	});
	const classes = useStyles();

	if(userIsLoading) return "loading..."
	if(userError) return userError.message;
	if(!user)
		return <Box m={2}><Button href="/api/auth/login" variant="contained">Login</Button></Box>

	let reminderPart: React.ReactElement;
	if(reminderLoading) reminderPart = <span>loading reminders...</span>;
	else if(reminderError) reminderPart = <span>{reminderError.message}</span>;
	else reminderPart = (
		<code style={{whiteSpace: "pre-wrap"}}>
			{JSON.stringify(reminderData, undefined, 3)}
		</code>
	);
	return (
		<>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableRow>
							<TableCell>Property</TableCell>
							<TableCell>Value</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
					{Object.keys(user).map((key, i) => (
						<TableRow key={i}>
							<TableCell>{key}</TableCell>
							<TableCell>{String(user[key])}</TableCell>
						</TableRow>
					))}
					</TableBody>
				</Table>
			</TableContainer>
			<Box ml={2}>
				<Button href="/api/auth/logout" variant="contained">Logout</Button>
			</Box>
			<Box ml={2}>
				{reminderPart}
			</Box>
		</>
	);
}

export default Index;