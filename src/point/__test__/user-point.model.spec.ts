import { UserPointModel } from '../user-point.model';
import { CannotUsePointError, PointValidateError } from '../error';

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

  it('사용 또는 충전할 Point는 0 보다 커야 한다', () => {
    const minusPoint = -100;

    expect(() => {
      userPointModel.validatePoint(minusPoint);
    }).toThrow(PointValidateError);
  });

  it('충전할 Point는 Number.MAX_SAFE_INTEGER 보다 작아야 한다.', () => {
    const maxPoint = Number.MAX_SAFE_INTEGER + 1;

    expect(() => {
      userPointModel.validatePoint(maxPoint);
    }).toThrow(PointValidateError);
  });

  it('Point를 사용한다', () => {
    userPointModel.use(50);

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(50);
  });

  it('남은 Point보다 더 많은 Point를 사용한다', () => {
    expect(() => {
      userPointModel.use(101);
    }).toThrow(CannotUsePointError);
  });

  it('Point를 충전한다.', () => {
    userPointModel.charge(50);

    const remainPoint = userPointModel.point;

    expect(remainPoint).toEqual(150);
  });
});
