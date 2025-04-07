// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Profile } from "./entity/Profile";
import { Post } from "./entity/Post";
import { Group } from "./entity/Group";
import { Category } from "./entity/Category";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:postgres@127.0.0.1:6433/mydb?schema=db_test",
  synchronize: true,
  logging: false,
  entities: [User, Profile, Post, Group, Category],
});
