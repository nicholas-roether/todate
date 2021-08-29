import { Typography } from "@material-ui/core";
import React from "react";
import CalendarView from "../src/frontend/components/calendar_view";
import Page from "../src/frontend/components/page";

const Index = () => {
	return (
		<Page title="home">
			<CalendarView date={new Date()} />
		</Page>
	);
}

export default Index;