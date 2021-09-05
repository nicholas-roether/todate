import React from "react";
import ListPicker, { ListPickerClassesProp } from "./list_picker";

interface YearPickerProps {
	year: number;
	label?: string;
	size?: "medium" | "small";
	className?: string;
	classes?: ListPickerClassesProp;
	onYearChange?: (newYear: number) => void;
	placeholder?: string;
}

const minYear = -273721;
const maxYear = 273860;

function validateYearString(
	yearString: string
): [isValid: boolean, errMessage: string | null] {
	const year = Number.parseInt(yearString);
	if (year == NaN) return [false, "Year must be a number."];
	if (year < minYear || year > maxYear)
		return [false, "Year outside supported range"];
	return [true, null];
}

const YearPicker = ({
	year,
	onYearChange,
	size,
	label,
	className,
	classes: classesProp = {},
	placeholder
}: YearPickerProps) => {
	const [error, setError] = React.useState<string | null>(null);

	const tryUpdateYear = React.useCallback(
		(yearString: string) => {
			const [valid, errorMessage] = validateYearString(yearString);
			if (!valid) setError(errorMessage);
			else {
				setError(null);
				onYearChange?.(Number.parseInt(yearString));
			}
		},
		[onYearChange]
	);

	if (year < minYear || year > maxYear)
		throw new Error(`Year ${year} is outside the supported range.`);

	return (
		<ListPicker
			value={year.toString()}
			tryUpdateValue={tryUpdateYear}
			onValueUp={() => onYearChange?.(year - 1)}
			onValueDown={() => onYearChange?.(year + 1)}
			disableUp={year == maxYear}
			disableDown={year == minYear}
			error={Boolean(error)}
			errorText={error ?? undefined}
			label={label}
			size={size}
			validValues={/^-?[0-9]*$/}
			className={className}
			classes={classesProp}
			placeholder={placeholder}
		/>
	);
};

export default YearPicker;
