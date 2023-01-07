import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { Upvote } from "./Upvote";
import { User } from "./User";

@ObjectType()
@Entity({ name: "post" })
export class Post {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({ unique: true })
	title!: string;

	@Field()
	@Column()
	text!: string;

	@Field()
	@Column()
	imageUrl!: string;

	@Field()
	@Column()
	imagePublicId!: string;

	@Field(() => Int, { nullable: true })
	voteStatus: number | null;

	@Field()
	@Column({ type: "int", default: 0 })
	points!: number;

	@OneToMany(() => Upvote, (upvote) => upvote.post)
	upvotes: Upvote[];

	@Field(() => Int)
	@Column()
	creatorId: number;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@Field(() => String)
	@CreateDateColumn()
	createdAt!: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt!: Date;
}
