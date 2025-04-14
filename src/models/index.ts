import { Sequelize } from "sequelize-typescript";

import { User } from "./User";
import { Profile } from "./Profile";
import { Post } from "./Post";
import { Group } from "./Group";
import { Category } from "./Category";
import { UserGroup } from "./UserGroup";

let queryCount = 0;

export const logging = (sql: string, timing?: any) => {
  queryCount++;
  console.log(`[SQL ${queryCount}]`, sql);
};

export const resetQueryCount = () => (queryCount = 0);
export const getQueryCount = () => queryCount;

// Initialize Sequelize with the PostgreSQL dialect and connection details
export const sequelize = new Sequelize({
  dialect: "postgres",
  host: "127.0.0.1",
  port: 6433,
  username: "postgres",
  password: "postgres",
  database: "mydb",
  schema: "db_sequelize_test",
  models: [User, Profile, Post, Group, Category,UserGroup],
  logging,
});
