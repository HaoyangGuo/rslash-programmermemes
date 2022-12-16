import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class User {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field(() => String)
	@CreateDateColumn()
	createdAt!: Date;

	@Field(() => String)
	@UpdateDateColumn()
  updatedAt!: Date;
  
  @Field(() => String)
	@Column({unique: true})
	username!: string;
	
	@Field(() => String)
	@Column({unique: true})
	email!: string;
  
  @Column()
  password!: string;
}
