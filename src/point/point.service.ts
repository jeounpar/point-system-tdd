import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { UserPointRepository } from './repository/user-point-repository';
import { PointHistoryRepository } from './repository/point-history-repository';
import { SimpleLock } from '../util/simple-lock';

@Injectable()
export class PointService {
  constructor(
    private readonly _pointHistoryRepo: PointHistoryRepository,
    private readonly _userPointRepo: UserPointRepository,
  ) {}

  @SimpleLock
  public async fetchUserPoint({
    userId,
  }: {
    userId: number;
  }): Promise<UserPoint> {
    const userHistory = await this._userPointRepo.findById({ userId });

    return userHistory.toInfo();
  }

  @SimpleLock
  public async fetchPointHistory({
    userId,
  }: {
    userId: number;
  }): Promise<PointHistory[]> {
    const pointHistories = await this._pointHistoryRepo.findById({ userId });

    return pointHistories.map((history) => history.toInfo());
  }

  @SimpleLock
  public async usePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userHistory = await this._userPointRepo.findById({ userId });

    const pointHistory = userHistory.transaction({
      amount,
      updateMillis: now,
      type: TransactionType.USE,
    });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userHistory,
    });

    return savedUserPoint.toInfo();
  }

  @SimpleLock
  public async chargePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userHistory = await this._userPointRepo.findById({ userId });

    const pointHistory = userHistory.transaction({
      amount,
      updateMillis: now,
      type: TransactionType.CHARGE,
    });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userHistory,
    });

    return savedUserPoint.toInfo();
  }
}
