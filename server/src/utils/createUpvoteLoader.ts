import DataLoader from "dataloader";
import { AppDataSource } from "../data-source";
import { Upvote } from "../entity/Upvote";

export const createUpvoteLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Upvote | null>(
		async (keys) => {
			const upvoteRepository = AppDataSource.getRepository(Upvote);

			const upvotes = await upvoteRepository.findByIds(keys as any);
			const upvoteIdsToUpvote: Record<string, Upvote> = {};
			upvotes.forEach((u) => {
				upvoteIdsToUpvote[`${u.userId}|${u.postId}`] = u;
			});

			return keys.map(
				(key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`]
			);
		}
	);
