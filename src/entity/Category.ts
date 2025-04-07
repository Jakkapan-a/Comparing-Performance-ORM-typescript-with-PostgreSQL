// src/entity/Category.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany
  } from "typeorm";
  import { Post } from "./Post";
  
  @Entity()
  export class Category {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ unique: true })
    name!: string;
  
    @OneToMany(() => Post, post => post.category)
    posts!: Post[];
  }
  