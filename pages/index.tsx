import { Box, Button, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import React from "react";
import { useUser } from "../src/auth/fetchUser";

const useStyles = makeStyles(theme => ({
	tableContainer: {
		width: "650px",
		margin: theme.spacing(4, 2)
	},
	table: {
		width: "650px"
	}
}))

const Index = () => {
	const { data, error } = useUser();
	const classes = useStyles();
	if(error) return String(error);
	if(data === null)
		return <Box m={2}><Button href="/api/auth/login" variant="contained">Login</Button></Box>
	if(!data) return "loading..."
	return (
		<>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table}>
					<TableHead>
						<TableCell>Property</TableCell>
						<TableCell>Value</TableCell>
					</TableHead>
					<TableBody>
					{Object.keys(data).map((key, i) => (
						<TableRow key={i}>
							<TableCell>{key}</TableCell>
							<TableCell>{String(data[key])}</TableCell>
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