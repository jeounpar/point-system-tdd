import { UserPointModel } from '../user-point.model';
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

  it('포인트를 사용하면 사용히스토리가 생성된다.', () => {
    const updateMillis = 1005;

    const pointHistory = userPointModel.use({
      point: 50,
      updateMillis,
    });

    expect(pointHistory).toEqual({
      userId: 1,
      type: TransactionType.USE,
      amount: 50,
      timeMillis: updateMillis,
    });
    expect(userPointModel.toInfo()).toEqual({
      id: 1,
      point: 50,
      updateMillis: updateMillis,
    });
  });

  it('포인트를 충전하면 충전히스토리가 생성된다.', () => {
    const updateMillis = 1005;

    const pointHistory = userPointModel.charge({
      point: 50,
      updateMillis,
    });

    expect(pointHistory).toEqual({
      userId: 1,
      type: TransactionType.CHARGE,
      amount: 50,
      timeMillis: updateMillis,
    });
    expect(userPointModel.toInfo()).toEqual({
      id: 1,
      point: 150,
      updateMillis: updateMillis,
    });
  });
});
