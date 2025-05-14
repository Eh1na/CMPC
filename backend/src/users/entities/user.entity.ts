// src/users/entities/user.entity.ts
import { Table, Column, Model, PrimaryKey, AutoIncrement, Unique, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Unique
  @Column({
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  })
  declare username: string;

  @Column({
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 100]
    }
  })
  declare password: string;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}