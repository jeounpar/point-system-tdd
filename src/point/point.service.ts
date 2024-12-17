import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from '../database/pointhistory.table';
import { PointHistory, UserPoint } from './point.model';
import { UserPointRepository } from './repository/user-point-repository';

@Injectable()
export class PointService {
  constructor(
    private readonly _pointHistoryRepo: PointHistoryTable,
    private readonly _userPointRepo: UserPointRepository,
  ) {}

  public async fetchUserPoint({
    userId,
  }: {
    userId: number;
  }): Promise<UserPoint> {
    const userHistory = await this._userPointRepo.findById({ userId });

    return userHistory;
  }

  public async fetchPointHistory({
    userId,
  }: {
    userId: number;
  }): Promise<PointHistory[]> {
    const pointHistories =
      await this._pointHistoryRepo.selectAllByUserId(userId);

    return pointHistories;
  }

  public async usePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<PointHistory[]> {
    return;
  }
}
