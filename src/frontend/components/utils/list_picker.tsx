import {
	IconButton,
	makeStyles,
	TextField,
	TextFieldProps
} from "@material-ui/core";
import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon
} from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
	container: {
		display: "inline-flex",
		flexDirection: "column",
		alignItems: "center"
	},
	textField: {
		margin: theme.spacing(1, 0)
	}
}));

export interface ListPickerClassesProp {
	buttons?: string;
	textField?: string;
}

export interface ListPickerProps {
	value: string;
	tryUpdateValue?: (newValue: string) => void;
	onValueUp?: () => void;
	onValueDown?: () => void;
	disableUp?: boolean;
	disableDown?: boolean;
	error?: boolean;
	errorText?: string;
	label?: string;
	textFieldProps?: TextFieldProps;
	validValues?: RegExp;
	size?: "medium" | "small";
	className?: string;
	classes?: ListPickerClassesProp;
	placeholder?: string;
	autoComplete?: string[];
}

const ListPicker = ({
	value: startValue,
	tryUpdateValue,
	onValueUp,
	onValueDown,
	disableUp = false,
	disableDown = false,
	error = false,
	errorText,
	label,
	textFieldProps,
	validValues,
	size = "medium",
	className,
	classes: classesProp = {},
	placeholder,
	autoComplete
}: ListPickerProps) => {
	const classes = useStyles();
	const [value, setValue] = React.useState<string>(startValue);

	useEffect(() => {
		setValue(startValue);
	}, [startValue]);

	const onKeyPress = React.useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			if (evt.key === "Enter") {
				evt.preventDefault();
				tryUpdateValue?.(value);
			}
		},
		[tryUpdateValue, value]
	);

	const onBlur = React.useCallback(
		() => tryUpdateValue?.(value),
		[tryUpdateValue, value]
	);

	const onChange = React.useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			if (!validValues || validValues.test(evt.target.value))
				setValue(evt.target.value);
		},
		[validValues]
	);

	return (
		<div className={clsx(classes.container, className)}>
			<IconButton
				className={classesProp.buttons}
				onClick={onValueUp}
				disabled={disableUp}
			>
				<KeyboardArrowUpIcon />
			</IconButton>
			<form onSubmit={(evt) => console.log(evt)}>
				<TextField
					variant="outlined"
					value={value}
					className={clsx(classes.textField, classesProp.textField)}
					onChange={onChange}
					onKeyPress={onKeyPress}
					onBlur={onBlur}
					error={error}
					label={label}
					helperText={error && errorText}
					size={size}
					placeholder={placeholder}
					autoComplete={autoComplete?.join(" ")}
					{...textFieldProps}
				/>
			</form>
			<IconButton
				className={classesProp.buttons}
				onClick={onValueDown}
				disabled={disableDown}
			>
				<KeyboardArrowDownIcon />
			</IconButton>
		</div>
	);
};

export default ListPicker;
