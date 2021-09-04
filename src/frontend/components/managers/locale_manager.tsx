import React from "react";
import { Locale } from "../../../i18n/locale";

const LocaleContext = React.createContext<string>("en-US");
const LocaleSetterContext = React.createContext<(newLocale: string) => void>(
	() => {}
);

interface LocaleManagerProps {
	defaultValue?: string;
}

const LocaleManager = ({
	defaultValue = Locale.ENGLISH,
	children
}: React.PropsWithChildren<LocaleManagerProps>) => {
	const [locale, setLocale] = React.useState(defaultValue);

	return (
		<LocaleSetterContext.Provider value={setLocale}>
			<LocaleContext.Provider value={locale}>
				{children}
			</LocaleContext.Provider>
		</LocaleSetterContext.Provider>
	);
};

function useLocale() {
	return React.useContext(LocaleContext);
}

function useLocaleSetter() {
	return React.useContext(LocaleSetterContext);
}

export { LocaleContext, LocaleSetterContext, useLocale, useLocaleSetter };

export default LocaleManager;
