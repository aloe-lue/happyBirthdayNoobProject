import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	entry: "./src/index.html",

	experiments: {
		html: true,
	},

	mode: "production",

	output: {
		filename: "[name].bundle.js",
		htmlFilename: "[name].html",
		path: path.resolve(__dirname, "dist"),
		clean: true,
		publicPath: '/',
	},

	devtool: "inline-source-map",
	devServer: {
		static: "./dist",
	},

	module: {
		rules: [
			{
				test: /\.(webmanifest|ico|png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",

				generator: {
					filename: "[name][ext]",
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
			},
		],
	},
};
