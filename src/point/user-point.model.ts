import { PointHistory, TransactionType, UserPoint } from './point.model';
import { CannotUsePointError, PointValidateError } from './error';

type UserPointInsertType = Omit<UserPoint, 'updateMillis'>;
type PointHistoryInsertType = Omit<PointHistory, 'id'>;

export class UserPointModel {
  private _id: number;
  private _point: number;
  private _updateMillis: number;

  private constructor() {}

  public static fromDB(userPoint: UserPoint): UserPointModel {
    const userPointModel = new UserPointModel();

    userPointModel._id = userPoint.id;
    userPointModel._point = userPoint.point;
    userPointModel._updateMillis = userPoint.updateMillis;

    return userPointModel;
  }

  public toInsert(): UserPointInsertType {
    return {
      id: this._id,
      point: this._point,
    };
  }

  public use({
    point,
    updateMillis,
  }: {
    point: number;
    updateMillis: number;
  }): PointHistoryInsertType {
    this.validatePoint(point);

    if (this._point - point < 0)
      throw new CannotUsePointError(
        `point cannot be negative. currentPoint=${this._point} & point=${point}`,
      );
    this._point = this._point - point;
    this._updateMillis = updateMillis;

    return {
      userId: this._id,
      amount: point,
      type: TransactionType.USE,
      timeMillis: this._updateMillis,
    };
  }

  public charge({
    point,
    updateMillis,
  }: {
    point: number;
    updateMillis: number;
  }) {
    this.validatePoint(point);

    if (this._point - point < 0)
      throw new CannotUsePointError(
        `point cannot be negative. currentPoint=${this._point} & point=${point}`,
      );
    this._point = this._point + point;
    this._updateMillis = updateMillis;

    return {
      userId: this._id,
      amount: point,
      type: TransactionType.CHARGE,
      timeMillis: this._updateMillis,
    };
  }

  public validatePoint(point: number) {
    if (point < 0 || point > Number.MAX_SAFE_INTEGER)
      throw new PointValidateError(
        'point must be greater than or equal to 0 or less than Number.MAX_VALUE',
      );
  }

  public toInfo(): UserPoint {
    return {
      id: this._id,
      point: this._point,
      updateMillis: this._updateMillis,
    };
  }

  public get id(): number {
    return this._id;
  }

  public get point(): number {
    return this._point;
  }

  public get updateMillis(): number {
    return this._updateMillis;
  }
}
