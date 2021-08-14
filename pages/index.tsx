import { useUser } from "@auth0/nextjs-auth0";
import { Box, Button, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(theme => ({
	tableContainer: {
		width: "650px",
		margin: theme.spacing(4, 2)
	},
	table: {
		width: "650px"
	}
}));

console.log("test2");

const Index = () => {
	const { user, error, isLoading } = useUser();
	const classes = useStyles();
	if(isLoading) return "loading..."
	if(error) return String(error);
	if(!user)
		return <Box m={2}><Button href="/api/auth/login" variant="contained">Login</Button></Box>
	return (
		<>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableCell>Property</TableCell>
						<TableCell>Value</TableCell>
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
		</>
	);
}

export default Index;