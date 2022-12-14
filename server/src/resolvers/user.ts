import { MyContext } from "src/types";
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { User } from "../entity/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

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
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: "username",
						message: "username must contain at least 2 characters",
					},
				],
			};
		}

		if (options.password.length <= 6) {
			return {
				errors: [
					{
						field: "password",
						message: "password must contain at least 6 characters",
					},
				],
			};
		}

		const userRepository = AppDataSource.getRepository(User);

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
		});
		await userRepository.save(user);

		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<UserResponse> {
		const userRepository = AppDataSource.getRepository(User);
		const user = await userRepository.findOneBy({ username: options.username });
		if (!user) {
			console.log("User not found");
			return {
				errors: [{ field: "username", message: "That username doesn't exist" }],
			};
		}
		const valid = await argon2.verify(user.password, options.password);
		if (!valid) {
			return {
				errors: [{ field: "password", message: "Incorrect password" }],
			};
		}

		req.session.userId = user.id;

		return { user };
	}
}
