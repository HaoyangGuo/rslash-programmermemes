import { DataSource } from "typeorm";
import { Request, Response } from "express";
import { Session } from "express-session";

export type MyContext = {
	AppDataSource: DataSource;
	req: Request & { session: Session & { userId?: number }};
	res: Response;
};