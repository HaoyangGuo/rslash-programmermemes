import { isAuth } from "../middleware/isAuth";
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { Post } from "../entity/Post";
import { MyContext } from "../types";
import { Upvote } from "../entity/Upvote";
import { User } from "../entity/User";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
	@Field()
	imageUrl: string;
	@Field()
	imagePublicId: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(@Root() post: Post, @Ctx() { upvoteLoader, req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}

		const upvote = await upvoteLoader.load({ postId: post.id, userId: req.session.userId });
		
		return upvote ? upvote.value : null;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async cancelVote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { AppDataSource, req }: MyContext
	) {
		const upvoteRepository = AppDataSource.getRepository(Upvote);
		const postRepository = AppDataSource.getRepository(Post);
		const existingUpvote = await upvoteRepository.findOneBy({
			userId: req.session.userId,
			postId,
		});
		const existingPost = await postRepository.findOne({
			where: { id: postId },
		});

		if (existingUpvote && existingUpvote.value === value && existingPost) {
			await upvoteRepository.delete({
				userId: req.session.userId,
				postId,
			});
			await AppDataSource.createQueryBuilder()
				.update(Post)
				.set({
					points: () => `points - ${value}`,
				})
				.where("id = :id", { id: postId })
				.execute();
		}

		return true;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { AppDataSource, req }: MyContext
	) {
		const isUpvote = value !== -1;
		const realValue = isUpvote ? 1 : -1;
		const { userId } = req.session;
		const upvoteRepository = AppDataSource.getRepository(Upvote);

		const existingUpvote = await upvoteRepository.findOneBy({
			userId,
			postId,
		});

		if (existingUpvote && existingUpvote.value !== realValue) {
			await AppDataSource.transaction(async (manager) => {
				await manager.query(
					`
					update upvote
					set value = ${realValue}
					where "postId" = ${postId} and "userId" = ${userId};
					`
				);
				await manager.query(
					`
					update post
					set points = points + ${2 * realValue}
					where id = ${postId};
					`
				);
			});
		} else if (!existingUpvote) {
			await AppDataSource.transaction(async (manager) => {
				await manager.query(
					`
					insert into upvote ("userId", "postId", value)
					values (${userId}, ${postId}, ${realValue});
					`
				);
				await manager.query(
					`
					update post
					set points = points + ${realValue}
					where id = ${postId};
					`
				);
			});
		}
		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
		@Ctx() { AppDataSource }: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const postRepository = AppDataSource.getRepository(Post);

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		let posts;
		try {
			posts = await postRepository.query(
				`
			select p.*
			from post p
			${cursor ? `where p."createdAt" < $2` : ""}
			order by p."createdAt" DESC
			limit $1
			`,
				replacements
			);
		} catch (error) {
			console.log(error);
		}

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	async post(
		@Arg("id", () => Int!) id: number,
		@Ctx() { AppDataSource }: MyContext
	): Promise<Post | null> {
		const postRepository = AppDataSource.getRepository(Post);
		let post = await postRepository.findOne({
			where: { id },
		});

		return post;
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<Post> {
		const postRepository = AppDataSource.getRepository(Post);
		return postRepository.save({
			...input,
			creatorId: req.session.userId,
		});
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int!) id: number,
		@Arg("title", () => String) title: string,
		@Arg("text", () => String) text: string,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<Post | null> {
		const postRepository = AppDataSource.getRepository(Post);

		const result = await postRepository
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where("id = :id and creatorId = :creatorId", {
				id,
				creatorId: req.session.userId,
			})
			.returning("*")
			.execute();

		return result.raw[0];
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int!) id: number,
		@Ctx() { AppDataSource, req }: MyContext
	): Promise<Boolean> {
		const postRepository = AppDataSource.getRepository(Post);

		await postRepository.delete({ id, creatorId: req.session.userId });

		return true;
	}
}
