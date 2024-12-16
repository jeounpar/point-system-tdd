import { UserPoint } from './point.model';
import { CannotUsePoint } from './error';

type UserPointForSave = Omit<UserPoint, 'updateMillis'>;

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

  public toSave(): UserPointForSave {
    return {
      id: this._id,
      point: this._point,
    };
  }

  public use(point: number) {
    if (this._point - point < 0)
      throw new CannotUsePoint(
        `point cannot be negative. currentPoint=${this._point} & point=${point}`,
      );
    this._point = this._point - point;
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
