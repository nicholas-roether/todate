import { Locale } from "./locale";
import messages_EN_US from "./messages/en-US.json";
import messages_DE_DE from "./messages/de-DE.json";
import messages_JA_JP from "./messages/ja-JP.json";

export interface Messages {
	[Locale.ENGLISH]: typeof messages_EN_US;
	[Locale.GERMAN]: typeof messages_DE_DE;
	[Locale.JAPANESE]: typeof messages_JA_JP;
}

export const messages: Messages = {
	[Locale.ENGLISH]: messages_EN_US,
	[Locale.GERMAN]: messages_DE_DE,
	[Locale.JAPANESE]: messages_JA_JP
};
