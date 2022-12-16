import { MyContext } from "src/types";
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

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

@Resolver()
export class UserResolver {
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
				errors: [{ field: "usernameOrEmail", message: "That username or email doesn't exist" }],
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
		@Ctx()
		@Arg("email") email: string,
		// { AppDataSource }: MyContext
	) {
		// const userRepository = AppDataSource.getRepository(User);
		return true;
	}
}
