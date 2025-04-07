// src/entity/Group.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToMany
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Group {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    name!: string;
  
    @ManyToMany(() => User, user => user.groups)
    users!: User[];
  }
  