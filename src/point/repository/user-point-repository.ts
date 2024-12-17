import { Injectable } from '@nestjs/common';
import { UserPointTable } from '../../database/userpoint.table';
import { UserPointModel } from '../user-point.model';

@Injectable()
export class UserPointRepository {
  constructor(private readonly _userpointTable: UserPointTable) {}

  public async findById({
    userId,
  }: {
    userId: number;
  }): Promise<UserPointModel> {
    const rawUserHistory = await this._userpointTable.selectById(userId);

    return UserPointModel.fromDB(rawUserHistory);
  }

  public async save({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPointModel> {
    const rawUserHistory = await this._userpointTable.insertOrUpdate(
      userId,
      amount,
    );

    return UserPointModel.fromDB(rawUserHistory);
  }
}
