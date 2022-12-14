import { AppDataSource } from "./data-source";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import { createClient } from "redis";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
	await AppDataSource.initialize()
		.then(() => {
			console.log("Data Source has been initialized!");
		})
		.catch((err) => {
			console.error("Error during Data Source initialization:", err);
		});

	const app = express();

	const RedisStore = connectRedis(session);
	const redisClient = createClient({ legacyMode: true });
	await redisClient.connect();

	redisClient.on("error", (err) => {
		console.error("Redis error:", err);
	});

	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				secure: __prod__,
				sameSite: "lax",
			},
			saveUninitialized: false,
			secret: "asidfhaiosufhiasovbsaudvh",
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			AppDataSource,
			req,
			res,
		}),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: {
			credentials: true,
			origin: "https://studio.apollographql.com",
		},
	});

	app.listen(4000, () => {
		console.log("Server started on localhost:4000");
	});
};

main().catch((err) => {
	console.error(err);
});
