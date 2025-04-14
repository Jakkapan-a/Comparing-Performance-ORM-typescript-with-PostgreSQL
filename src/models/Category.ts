import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    HasMany,
    Unique,
  } from "sequelize-typescript";
  import { Post } from "./Post";
  
  @Table
  export class Category extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Unique
    @Column(DataType.STRING)
    name!: string;
  
    @HasMany(() => Post)
    posts!: Post[];
  }
  