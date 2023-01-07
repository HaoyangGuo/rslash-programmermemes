import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity({ name: "upvote" })
export class Upvote {
	@Column({ type: "int" })
  value: number;
  
	@Column()
	@PrimaryColumn()
	userId: number;

	@ManyToOne(() => User, (user) => user.upvotes)
	user: User;

	@Column()
	@PrimaryColumn()
  postId: number;
  
	@ManyToOne(() => Post, (post) => post.upvotes, {
		onDelete: "CASCADE",
	})
	post: Post;
}
