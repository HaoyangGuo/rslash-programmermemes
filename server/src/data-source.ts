import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { Post } from "./entity/Post";
import { User } from "./entity/User";
import { Upvote } from "./entity/Upvote";
import path from "path";
import "dotenv-safe/config";


export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL,
	database: "typed_reddit",
	synchronize: false,
	entities: [Post, User, Upvote],
	migrations: [path.join(__dirname, "/migrations/*")],
});
