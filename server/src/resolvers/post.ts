import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entity/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { AppDataSource }: MyContext): Promise<Post[]> {
		const postRepository = AppDataSource.getRepository(Post);
		return postRepository.find();
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg("id") id: number,
		@Ctx() { AppDataSource }: MyContext
	): Promise<Post | null> {
		const postRepository = AppDataSource.getRepository(Post);
		return postRepository.findOneBy({ id });
	}

	@Mutation(() => Post)
	async createPost(
		@Arg("title") title: string,
		@Ctx() { AppDataSource }: MyContext
	): Promise<Post> {
		const postRepository = AppDataSource.getRepository(Post);
		return postRepository.save({ title });
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() { AppDataSource }: MyContext
	): Promise<Post | null> {
		const postRepository = AppDataSource.getRepository(Post);
		const post = await postRepository.findOneBy({ id });
		if (!post) {
			return null;
		}
		if (typeof title !== "undefined") {
			post.title = title;
			await postRepository.save(post);
		}
		return post;
	}

	@Query(() => Boolean)
	async deletePost(
		@Arg("id") id: number,
		@Ctx() { AppDataSource }: MyContext
	): Promise<Boolean> {
		const postRepository = AppDataSource.getRepository(Post);
		await postRepository.delete({ id });
		return true;
	}
}
