import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    BelongsToMany,
  } from "sequelize-typescript";
  import { User } from "./User";
  import { UserGroup } from "./UserGroup";
  
  @Table
  export class Group extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.STRING)
    name!: string;
    
    @BelongsToMany(() => User, () => UserGroup)
    users!: User[];
  }
  