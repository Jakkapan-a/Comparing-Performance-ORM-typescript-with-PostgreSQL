// src/entity/Post.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne
  } from "typeorm";
  import { User } from "./User";
  import { Category } from "./Category";
  
  @Entity()
  export class Post {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    title!: string;
  
    @Column({ nullable: true })
    content!: string;
  
    @Column({ default: false })
    published!: boolean;
  
    @ManyToOne(() => User, user => user.posts, {
      onDelete: "CASCADE"
    })
    author!: User;
  
    @ManyToOne(() => Category, category => category.posts, { nullable: true })
    category!: Category;
  }
  