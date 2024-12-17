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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
