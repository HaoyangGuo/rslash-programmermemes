import { AppDataSource } from "./data-source";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import cors from "cors";
import imageRouter from "./utils/imageRouter";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import "dotenv-safe/config";

const main = async () => {
	await AppDataSource.initialize()
		.then(() => {
			console.log("Data Source has been initialized!");
		})
		.catch((err) => {
			console.error("Error during Data Source initialization:", err);
		});
	await AppDataSource.runMigrations();

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis(process.env.REDIS_URL);
	app.set("trust proxy", 1);

	app.use(
		cors({
			credentials: true,
			origin: process.env.CORS_ORIGIN,
		})
	);

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis as any,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				secure: __prod__,
				sameSite: "none",
				domain: __prod__ ? process.env.COOKIE_DOMAIN : undefined,
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET as string,
			resave: false,
		})
	);

	app.use("/rest", imageRouter);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			AppDataSource,
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			upvoteLoader: createUpvoteLoader(),
		}),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	app.listen(parseInt(process.env.PORT), () => {
		console.log(`Server started on localhost:${parseInt(process.env.PORT)}`);
	});
};

main().catch((err) => {
	console.error(err);
});
