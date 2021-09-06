module.exports = {
	reactStrictMode: true,
	i18n: {
		locales: ["en", "de", "ja"],
		defaultLocale: "en"
	},
	webpack: (config) => {
		config.module.rules.push({
			test: /\.graphql$/,
			include: /src/,
			exclude: /node_modules/,
			loader: "graphql-tag/loader"
		});
		return config;
	}
};
