import { MyContext } from "src/types";
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import "dotenv-safe/config";

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		if (req.session.userId === user.id) {
			return user.email;
		}
		return "";
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { AppDataSource, req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}

		const userRepository = AppDataSource.getRepository(User);

		return userRepository.findOneBy({ id: req.session.userId });
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<UserResponse> {
		const userRepository = AppDataSource.getRepository(User);

		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const existingUser = await userRepository.findOneBy({
			username: options.username,
		});
		if (existingUser) {
			return {
				errors: [
					{
						field: "username",
						message: "username already taken",
					},
				],
			};
		}

		const existingEmail = await userRepository.findOneBy({
			email: options.email,
		});
		if (existingEmail) {
			return {
				errors: [
					{
						field: "email",
						message: "email already exists",
					},
				],
			};
		}

		const hashedPassword = await argon2.hash(options.password);
		const user = userRepository.create({
			username: options.username,
			password: hashedPassword,
			email: options.email,
		});
		await userRepository.save(user);

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<UserResponse> {
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy(
			usernameOrEmail.includes("@")
				? { email: usernameOrEmail }
				: { username: usernameOrEmail }
		);
		if (!user) {
			return {
				errors: [
					{
						field: "usernameOrEmail",
						message: "That username or email doesn't exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [{ field: "password", message: "Incorrect password" }],
			};
		}

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	logout(
		@Ctx()
		{ req, res }: MyContext
	) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					resolve(false);
					return;
				}

				resolve(true);
			})
		);
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { AppDataSource, redis }: MyContext
	) {
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ email });
		if (!user) {
			// console.log("user not found");
			return true;
		}

		const token = v4();

		const key = FORGET_PASSWORD_PREFIX + token;
		await redis.set(key, user.id, "px" as any, 1000 * 60 * 60 * 24 * 3);

		// console.log("forgot: token: ", token)
		// console.log("forgot: userid: ", await redis.get(key))
		// console.log("email sent");

		await sendEmail(
			email,
			`${process.env.CORS_ORIGIN}/change-password/${token}`
		);

		
		return true;
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { AppDataSource, req, redis }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length < 6) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "new password must contain at least 6 characters",
					},
				],
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);
		if (!userId) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "token expired",
					},
				],
			};
		}

		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ id: parseInt(userId) });
		if (!user) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "user no longer exists",
					},
				],
			};
		}

		const hashedPassword = await argon2.hash(newPassword);
		user.password = hashedPassword;
		await userRepository.save(user);
		req.session.userId = user.id;

		await redis.del(key);

		return { user };
	}
}
