import { Paper } from "@material-ui/core";
import React from "react";
import CalendarView from "../src/frontend/components/main_view_desktop/calendar_view_desktop";
import Page from "../src/frontend/components/page";
import ResizableContainer from "../src/frontend/components/resizable_container";
import Clock from "../src/frontend/components/clock";
import MainViewDesktop from "../src/frontend/components/main_view_desktop";

const Index = () => {
	const [page, setPage] = React.useState<number>(0);
	return (
		<Page title="home">
			<MainViewDesktop
				startDate={new Date()}
				page={page}
				onUpdatePage={(pageDiff) => setPage((page) => page + pageDiff)}
			/>
		</Page>
	);
};

export default Index;
