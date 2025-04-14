import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    HasMany,
    HasOne,
    BelongsToMany,
    Unique,
  } from "sequelize-typescript";
  import { Post } from "./Post";
  import { Profile } from "./Profile";
  import { Group } from "./Group";
  import { UserGroup } from "./UserGroup";
  
  @Table
  export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.STRING)
    name!: string;
  
    @Unique
    @Column(DataType.STRING)
    email!: string;
  
    @HasMany(() => Post)
    posts!: Post[];
  
    @HasOne(() => Profile)
    profile!: Profile;
  
    @BelongsToMany(() => Group, () => UserGroup)
    groups!: Group[];

    setGroups!: (groups: Group[]) => Promise<void>;

  }
  