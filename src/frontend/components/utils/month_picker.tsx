import React from "react";
import { useIntl } from "react-intl";
import ListPicker, { ListPickerClassesProp } from "./list_picker";

interface MonthPickerProps {
	month: number;
	label?: string;
	size?: "medium" | "small";
	className?: string;
	classes?: ListPickerClassesProp;
	onMonthChange?: (newMonth: number) => void;
	placeholder?: string;
}

function validateMonthString(
	monthString: string,
	validMonths: string[]
): [isValid: boolean, errMessage: string | null] {
	const monthNum = Number.parseInt(monthString);
	if (validMonths.includes(monthString)) return [true, null];
	if (monthNum !== NaN && monthNum >= 1 && monthNum <= 12)
		return [true, null];
	return [false, "Must be a valid month"];
}

const MonthPicker = ({
	month,
	onMonthChange,
	size = "medium",
	label,
	className,
	classes: classesProp = {},
	placeholder
}: MonthPickerProps) => {
	const [error, setError] = React.useState<string | null>(null);
	const intl = useIntl();

	const [longMonthNames, shortMonthNames] = React.useMemo(() => {
		const date = new Date(0);
		const longMonths: string[] = [];
		const shortMonths: string[] = [];
		for (let i = 0; i < 12; i++) {
			date.setMonth(i);
			longMonths.push(intl.formatDate(date, { month: "long" }));
			shortMonths.push(intl.formatDate(date, { month: "short" }));
		}
		return [longMonths, shortMonths];
	}, [intl]);

	const validMonths = React.useMemo(
		() => [...longMonthNames, ...shortMonthNames],
		[longMonthNames, shortMonthNames]
	);

	const tryUpdateMonth = React.useCallback(
		(monthString: string, showErrors: boolean) => {
			const [valid, errorMessage] = validateMonthString(
				monthString,
				validMonths
			);
			if (!valid) {
				if (showErrors) setError(errorMessage);
			} else {
				setError(null);
				const parsed = Number.parseInt(monthString);
				let monthNum = 0;
				if (shortMonthNames.includes(monthString))
					monthNum = shortMonthNames.indexOf(monthString);
				else if (longMonthNames.includes(monthString))
					monthNum = longMonthNames.indexOf(monthString);
				else if (parsed != NaN) monthNum = parsed - 1;
				onMonthChange?.(monthNum);
			}
		},
		[longMonthNames, onMonthChange, shortMonthNames, validMonths]
	);

	const onValueUp = React.useCallback(
		() => onMonthChange?.(month - 1),
		[month, onMonthChange]
	);

	console.log(month);

	const onValueDown = React.useCallback(() => {
		console.log(month);
		onMonthChange?.(month + 1);
	}, [month, onMonthChange]);

	if (month < 0 || month > 11)
		throw new Error(`Month ${month} is not valid.`);

	const monthDate = new Date(0);
	monthDate.setMonth(month);

	return (
		<ListPicker
			value={intl.formatDate(monthDate, {
				month: size == "small" ? "short" : "long"
			})}
			tryUpdateValue={tryUpdateMonth}
			onValueUp={onValueUp}
			onValueDown={onValueDown}
			disableUp={month == 0}
			disableDown={month == 11}
			error={Boolean(error)}
			errorText={error ?? undefined}
			label={label}
			size={size}
			validValues={/(?:^-?[0-9]*$)|(?:^[a-zA-Z\u0080-\uFFFF]*$)/}
			className={className}
			classes={classesProp}
			placeholder={placeholder}
			suggestions={longMonthNames}
			autoSelect
			live
		/>
	);
};

export default MonthPicker;
