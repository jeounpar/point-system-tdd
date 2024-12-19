import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from '../point.service';
import { DatabaseModule } from '../../database/database.module';
import { UserPointRepository } from '../repository/user-point-repository';
import { PointHistoryRepository } from '../repository/point-history-repository';

describe('PointService', () => {
  let service: PointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [PointService, UserPointRepository, PointHistoryRepository],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  it('포인트 충전 후 포인트를 사용한다.', async () => {
    const userId: number = 1;
    await service.chargePoint({ userId, amount: 1000 });
    await service.usePoint({ userId, amount: 500 });
    await service.usePoint({ userId, amount: 300 });

    const userPoint = await service.fetchUserPoint({ userId });

    const remainPoint = userPoint.point;
    expect(remainPoint).toEqual(200);
  });

  it('3명의 유저에게 각각 500포인트를 충전하고 100포인트를 사용하는 6개의 요청(총 18개)을 동시에 처리한다.', async () => {
    const userA: number = 1;
    const userB: number = 2;
    const userC: number = 3;

    await Promise.all([
      service.chargePoint({ userId: userA, amount: 500 }),
      service.chargePoint({ userId: userB, amount: 500 }),
      service.chargePoint({ userId: userC, amount: 500 }),
    ]);

    try {
      await Promise.allSettled([
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userA, amount: 100 }),
        ),
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userB, amount: 100 }),
        ),
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userC, amount: 100 }),
        ),
      ]);
    } catch (error) {}

    const [userPoint_A, userPoint_B, userPoint_C] = await Promise.all([
      service.fetchUserPoint({ userId: userA }),
      service.fetchUserPoint({ userId: userB }),
      service.fetchUserPoint({ userId: userC }),
    ]);

    expect(userPoint_A.point).toEqual(0);
    expect(userPoint_B.point).toEqual(0);
    expect(userPoint_C.point).toEqual(0);
  });
});
