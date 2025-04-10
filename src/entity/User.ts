// src/entity/User.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany, OneToOne, JoinColumn, ManyToMany
  } from "typeorm";
  import { Post } from "./Post";
  import { Profile } from "./Profile";
  import { Group } from "./Group";
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id!: number
  
    @Column()
    name!: string;
  
    @Column({ unique: true })
    email!: string;
  
    @OneToMany(() => Post, post => post.author)
    posts!: Post[];
  
    @OneToOne(() => Profile, profile => profile.user, { cascade: true })
    @JoinColumn()
    profile!: Profile;
  
    @ManyToMany(() => Group, group => group.users, { cascade: true })
    groups!: Group[];
  }
  