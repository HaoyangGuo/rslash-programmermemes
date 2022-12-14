import "reflect-metadata";
import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import { Post } from "./entity/Post";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "postgres",
	database: "typed_reddit",
	synchronize: !__prod__,
	entities: [Post, User],
	migrationsTableName: "migrations",
});
