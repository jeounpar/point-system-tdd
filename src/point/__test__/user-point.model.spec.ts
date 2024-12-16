import { UserPointModel } from '../user-point.model';
import { CannotUsePoint } from '../error';

describe('UserPointModel', () => {
  let userPointModel: UserPointModel;

  beforeEach(() => {
    userPointModel = UserPointModel.fromDB({
      id: 1,
      point: 100,
      updateMillis: 1234,
    });
  });

  it('UserPoint를 가져온다', () => {
    const userPoint = userPointModel.toInfo();
    expect(userPoint).toEqual({
      id: 1,
      point: 100,
      updateMillis: 1234,
    });
  });

  it('Point를 사용한다', () => {
    userPointModel.use(50);

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(50);
  });

  it('남은 Point보다 더 많은 Point를 사용한다', () => {
    expect(() => {
      userPointModel.use(101);
    }).toThrow(CannotUsePoint);
  });
});
