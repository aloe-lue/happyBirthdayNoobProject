import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import config from "./webpack.config.js";

const APP = express();
const COMPILER = webpack(config);

APP.use(webpackDevMiddleware(COMPILER, {
		publicPath: config.output.publicPath,
	}),
);

APP.listen(3000, () => {
	console.log("listening on port 3000!\n");
});
