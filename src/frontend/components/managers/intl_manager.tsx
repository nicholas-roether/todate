import React from "react";
import { IntlProvider } from "react-intl";
import { Locale } from "../../../i18n/locale";
import { messages } from "../../../i18n/messages";
import { useLocale } from "./locale_manager";

const IntlManager = ({ children }: React.PropsWithChildren<{}>) => {
	const locale = useLocale();
	console.log(locale, messages, messages[locale]);
	return (
		<IntlProvider
			defaultLocale={Locale.ENGLISH}
			locale={locale}
			messages={messages[locale]}
		>
			{children}
		</IntlProvider>
	);
};

export default IntlManager;
