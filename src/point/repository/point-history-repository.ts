import { PointHistoryTable } from '../../database/pointhistory.table';
import { PointHistoryModel } from '../point-history.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PointHistoryRepository {
  constructor(private readonly _pointHistoryTable: PointHistoryTable) {}

  public async findById({
    userId,
  }: {
    userId: number;
  }): Promise<PointHistoryModel[]> {
    const pointHistories =
      await this._pointHistoryTable.selectAllByUserId(userId);

    return pointHistories.map(PointHistoryModel.fromDB);
  }

  public async save({
    model,
  }: {
    model: PointHistoryModel;
  }): Promise<PointHistoryModel> {
    const rawPointHistory = await this._pointHistoryTable.insert(
      model.userId,
      model.amount,
      model.type,
      model.timeMillis,
    );

    return PointHistoryModel.fromDB(rawPointHistory);
  }
}
