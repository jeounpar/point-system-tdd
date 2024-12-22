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
    const rawUserPoint = await this._userpointTable.selectById(userId);

    return UserPointModel.fromDB(rawUserPoint);
  }

  public async save({
    model,
  }: {
    model: UserPointModel;
  }): Promise<UserPointModel> {
    const { id, amount } = model.toSave();
    const rawUserPoint = await this._userpointTable.insertOrUpdate(id, amount);

    return UserPointModel.fromDB(rawUserPoint);
  }
}
