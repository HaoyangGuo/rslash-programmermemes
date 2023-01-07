import DataLoader from "dataloader";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const createUserLoader = () =>
	new DataLoader<number, User>(async (userIds) => {
		const userRepository = AppDataSource.getRepository(User);
		const users = await userRepository.findByIds(userIds as number[]);
		const userIdToUser: Record<number, User> = {};
		users.forEach((u) => {
			userIdToUser[u.id] = u;
		});

		return userIds.map((userId) => userIdToUser[userId]);
	});
