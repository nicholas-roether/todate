import React, { useEffect } from "react";
import CalendarView from "../src/frontend/components/calendar_view";
import Page from "../src/frontend/components/page";

const Index = () => {
	const [page, setPage] = React.useState<number>(0);
	useEffect(() => {
		setInterval(() => {
			setPage((page) => page - 1);
		}, 5000);
	}, []);
	return (
		<Page title="home">
			<CalendarView
				startDate={new Date()}
				startPage={page}
				onUpdatePage={(newPage) => setPage(newPage)}
			/>
		</Page>
	);
};

export default Index;
