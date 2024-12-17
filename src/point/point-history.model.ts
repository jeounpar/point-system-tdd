import { PointHistory, TransactionType } from './point.model';

export class PointHistoryModel {
  private _id: number;
  private _userId: number;
  private _type: TransactionType;
  private _amount: number;
  private _timeMillis: number;

  private constructor() {}

  public static fromDB(pointHistory: PointHistory): PointHistoryModel {
    const model = new PointHistoryModel();

    model._id = pointHistory.id;
    model._userId = pointHistory.userId;
    model._type = pointHistory.type;
    model._amount = pointHistory.amount;
    model._timeMillis = pointHistory.timeMillis;

    return model;
  }

  public static createHistory({
    userId,
    type,
    amount,
    timeMillis,
  }: {
    userId: number;
    amount: number;
    timeMillis: number;
    type: TransactionType;
  }) {
    const model = new PointHistoryModel();

    model._userId = userId;
    model._type = type;
    model._amount = amount;
    model._timeMillis = timeMillis;

    return model;
  }

  public toInfo() {
    return {
      id: this._id,
      userId: this._userId,
      type: this._type,
      amount: this._amount,
      timeMillis: this._timeMillis,
    };
  }

  public get id(): number {
    return this._id;
  }

  public get userId(): number {
    return this._userId;
  }

  public get type(): TransactionType {
    return this._type;
  }

  public get amount(): number {
    return this._amount;
  }

  public get timeMillis(): number {
    return this._timeMillis;
  }
}
