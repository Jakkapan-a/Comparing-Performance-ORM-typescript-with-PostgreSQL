import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
  } from "sequelize-typescript";
  import { User } from "./User";
  import { Category } from "./Category";
  
  @Table
  export class Post extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @Column(DataType.STRING)
    title!: string;
  
    @Column(DataType.TEXT)
    content?: string;
  
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    published!: boolean;
  
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    authorId!: number;
  
    @BelongsTo(() => User, { onDelete: "CASCADE" })
    author!: User;
  
    @ForeignKey(() => Category)
    @Column(DataType.INTEGER)
    categoryId?: number;
  
    @BelongsTo(() => Category)
    category?: Category;
  }
  