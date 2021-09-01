import React, { useEffect } from "react";
import CalendarView from "../src/frontend/components/calendar_view";
import Page from "../src/frontend/components/page";

const Index = () => {
	const [page, setPage] = React.useState<number>(0);
	useEffect(() => {
		window.setInterval(() => {
			setPage((page) => page - 1);
		}, 4000);
	}, []);
	return (
		<Page title="home">
			<CalendarView
				startDate={new Date()}
				page={page}
				onUpdatePage={(pageDiff) => setPage((page) => page + pageDiff)}
			/>
		</Page>
	);
};

export default Index;
