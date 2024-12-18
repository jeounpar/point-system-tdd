import { TransactionType, UserPoint } from './point.model';
import { CannotUsePointError, PointValidateError } from './error';
import { PointHistoryModel } from './point-history.model';

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

  public toSave() {
    return {
      id: this._id,
      amount: this._point,
    };
  }

  public transaction({
    amount,
    updateMillis,
    type,
  }: {
    amount: number;
    updateMillis: number;
    type: TransactionType;
  }): PointHistoryModel {
    this.validateAmount(amount);

    if (type === TransactionType.USE) return this.use({ amount, updateMillis });
    return this.charge({ amount, updateMillis });
  }

  public use({
    amount,
    updateMillis,
  }: {
    amount: number;
    updateMillis: number;
  }): PointHistoryModel {
    if (this._point - amount < 0)
      throw new CannotUsePointError(
        `point cannot be negative. currentPoint=${this._point} & amount=${amount}`,
      );
    this._point = this._point - amount;
    this._updateMillis = updateMillis;

    return PointHistoryModel.createHistory({
      userId: this._id,
      amount,
      type: TransactionType.USE,
      timeMillis: updateMillis,
    });
  }

  public charge({
    amount,
    updateMillis,
  }: {
    amount: number;
    updateMillis: number;
  }): PointHistoryModel {
    this._point = this._point + amount;
    this._updateMillis = updateMillis;

    return PointHistoryModel.createHistory({
      userId: this._id,
      amount,
      type: TransactionType.CHARGE,
      timeMillis: updateMillis,
    });
  }

  public validateAmount(amount: number) {
    if (amount < 0 || amount > Number.MAX_SAFE_INTEGER)
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
