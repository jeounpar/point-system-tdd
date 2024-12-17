import { Injectable } from '@nestjs/common';
import { PointHistory, UserPoint } from './point.model';
import { UserPointRepository } from './repository/user-point-repository';
import { PointHistoryRepository } from './repository/point-history-repository';

@Injectable()
export class PointService {
  constructor(
    private readonly _pointHistoryRepo: PointHistoryRepository,
    private readonly _userPointRepo: UserPointRepository,
  ) {}

  public async fetchUserPoint({
    userId,
  }: {
    userId: number;
  }): Promise<UserPoint> {
    const userHistory = await this._userPointRepo.findById({ userId });

    return userHistory.toInfo();
  }

  public async fetchPointHistory({
    userId,
  }: {
    userId: number;
  }): Promise<PointHistory[]> {
    const pointHistories = await this._pointHistoryRepo.findById({ userId });

    return pointHistories.map((history) => history.toInfo());
  }

  public async usePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userHistory = await this._userPointRepo.findById({ userId });

    const pointHistory = userHistory.use({ amount, updateMillis: now });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userHistory,
    });

    return savedUserPoint.toInfo();
  }

  public async chargePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userHistory = await this._userPointRepo.findById({ userId });

    const pointHistory = userHistory.charge({ amount, updateMillis: now });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userHistory,
    });

    return savedUserPoint.toInfo();
  }
}
