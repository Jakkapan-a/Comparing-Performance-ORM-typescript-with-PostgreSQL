import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    Unique,
  } from "sequelize-typescript";
  import { User } from "./User";
  
  @Table
  export class Profile extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.STRING)
    bio!: string;
  
    @ForeignKey(() => User)
    @Unique
    @Column(DataType.INTEGER)
    userId!: number;
  
    @BelongsTo(() => User, { onDelete: "CASCADE" })
    user!: User;
  }
  