import { Injectable } from '@nestjs/common';
import { PointHistory, UserPoint } from './point.model';
import { UserPointRepository } from './repository/user-point-repository';
import { PointHistoryRepository } from './repository/point-history-repository';
import { UserLock } from '../util/user-lock';

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
    const userPoint = await this._userPointRepo.findById({ userId });

    return userPoint.toInfo();
  }

  public async fetchPointHistory({
    userId,
  }: {
    userId: number;
  }): Promise<PointHistory[]> {
    const pointHistories = await this._pointHistoryRepo.findById({ userId });

    return pointHistories.map((history) => history.toInfo());
  }

  @UserLock
  public async usePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userPoint = await this._userPointRepo.findById({ userId });

    const pointHistory = userPoint.use({
      amount,
      updateMillis: now,
    });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userPoint,
    });

    return savedUserPoint.toInfo();
  }

  @UserLock
  public async chargePoint({
    userId,
    amount,
  }: {
    userId: number;
    amount: number;
  }): Promise<UserPoint> {
    const now = Date.now();
    const userPoint = await this._userPointRepo.findById({ userId });

    const pointHistory = userPoint.charge({
      amount,
      updateMillis: now,
    });

    await this._pointHistoryRepo.save({ model: pointHistory });
    const savedUserPoint = await this._userPointRepo.save({
      model: userPoint,
    });

    return savedUserPoint.toInfo();
  }
}
