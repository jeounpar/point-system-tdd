import { UserPointModel } from '../user-point.model';
import { CannotUsePointError, PointValidateError } from '../error';
import { TransactionType } from '../point.model';

describe('UserPointModel', () => {
  let userPointModel: UserPointModel;

  beforeEach(() => {
    userPointModel = UserPointModel.fromDB({
      id: 1,
      point: 100,
      updateMillis: 1000,
    });
  });

  it('UserPoint를 가져온다', () => {
    const userPoint = userPointModel.toInfo();
    expect(userPoint).toEqual({
      id: 1,
      point: 100,
      updateMillis: 1000,
    });
  });

  it('사용 또는 충전할 Point는 0 보다 커야 한다', () => {
    const minusPoint = -100;

    expect(() => {
      userPointModel.validateAmount(minusPoint);
    }).toThrow(PointValidateError);
  });

  it('충전할 Point는 Number.MAX_SAFE_INTEGER 보다 작아야 한다.', () => {
    const maxPoint = Number.MAX_SAFE_INTEGER + 1;

    expect(() => {
      userPointModel.validateAmount(maxPoint);
    }).toThrow(PointValidateError);
  });

  it('Point를 사용한다', () => {
    userPointModel.use({ amount: 50, updateMillis: 1005 });

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(50);
  });

  it('남은 Point보다 더 많은 Point를 사용한다', () => {
    expect(() => {
      userPointModel.use({ amount: 101, updateMillis: 1005 });
    }).toThrow(CannotUsePointError);
  });

  it('Point를 충전한다.', () => {
    userPointModel.charge({ amount: 50, updateMillis: 1005 });

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(150);
  });

  it('포인트를 충전하면 updateMillis가 업데이트 된다', () => {
    userPointModel.charge({ amount: 50, updateMillis: 1005 });

    const updateMillis = userPointModel.updateMillis;

    expect(updateMillis).toEqual(1005);
  });

  it('UserPointModel의 transaction 메서드를 이용해 포인트를 사용한다', () => {
    userPointModel.transaction({
      amount: 50,
      updateMillis: 1005,
      type: TransactionType.USE,
    });

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(50);
  });

  it('UserPointModel의 transaction 메서드를 이용해 포인트를 충전한다', () => {
    userPointModel.transaction({
      amount: 50,
      updateMillis: 1005,
      type: TransactionType.CHARGE,
    });

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(150);
  });
});
