// src/entity/Profile.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToOne
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ nullable: true })
    bio!: string;
  
    @OneToOne(() => User, {
      onDelete: "CASCADE",
    })
    user!: User;
  }
  