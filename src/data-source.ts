// src/data-source.ts
import "reflect-metadata";
import { DataSource, Logger } from "typeorm";
import { User } from "./entity/User";
import { Profile } from "./entity/Profile";
import { Post } from "./entity/Post";
import { Group } from "./entity/Group";
import { Category } from "./entity/Category";


class MyLogger implements Logger {
  logQuery(query: string, parameters?: any[]) {
    // process.stdout.write(`[QUERY] ${query}\n`);

    // if (parameters) {
    //   process.stdout.write(`Parameters: ${JSON.stringify(parameters)}\n`);
    // }
  }
 
  logQueryError(error: string, query: string, parameters?: any[]) {
    // console.error("Query failed:", error, query, parameters);
  }
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    // console.warn("Slow query:", time, query, parameters);
  }
  logSchemaBuild(message: string) {
    // console.log("Schema build:", message);
  }
  logMigration(message: string) {
    // console.log("Migration:", message);
  }
  log(level: "log" | "info" | "warn", message: any) {
    console.log(level, message);
  }
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:postgres@192.168.1.36:6433/mydb",
  schema: "db_typeorm_test",
  port: 6433,
  synchronize: true,
  logging: false,
  // logging: ["query", "error"],
  // logger: new MyLogger(),
  entities: [User, Profile, Post, Group, Category],
});
