import { Typography } from "@material-ui/core";
import React from "react";
import { useEffect } from "react";
import { FormattedDate, FormattedMessage } from "react-intl";

const Clock = () => {
	const [time, setTime] = React.useState<number>(Date.now());

	useEffect(() => {
		setTimeout(() => setTime(Date.now()), 60000 - (Date.now() % 60000));
	});

	return (
		<Typography variant="h5">
			<FormattedMessage
				id="clock"
				defaultMessage="Today is {today, date, ::eeeeeyyyyMMdd}{br}{today, date, ::hhmm}"
				values={{ today: new Date(), br: <br /> }}
			/>
		</Typography>
	);
};

export default Clock;
