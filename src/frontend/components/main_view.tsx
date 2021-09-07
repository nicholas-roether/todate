import { makeStyles } from "@material-ui/core";
import React from "react";
import CalendarView from "./main_view/calendar_view";
import CalendarSidebar from "./main_view/calendar_sidebar";

const useStyles = makeStyles(() => ({
	container: {
		display: "flex",
		height: "100%"
	},
	drawer: {
		width: "100%",
		height: "100%"
	},
	drawerPaper: {
		width: "100%",
		position: "static",
		height: "100%"
	}
}));

interface MainViewProps {
	startDate: Date;
	page: number;
	onUpdatePage: (pageDiff: number) => void;
}

const MainView = ({ startDate, page, onUpdatePage }: MainViewProps) => {
	const classes = useStyles();
	return (
		<div className={classes.container}>
			<CalendarSidebar
				startDate={startDate}
				page={page}
				onUpdatePage={onUpdatePage}
			/>
			<CalendarView
				startDate={startDate}
				page={page}
				onUpdatePage={onUpdatePage}
			/>
		</div>
	);
};

export default MainView;
