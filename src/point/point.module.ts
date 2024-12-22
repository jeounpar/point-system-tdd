import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PointService } from './point.service';
import { UserPointRepository } from './repository/user-point-repository';
import { PointHistoryRepository } from './repository/point-history-repository';

@Module({
  imports: [DatabaseModule],
  providers: [PointService, UserPointRepository, PointHistoryRepository],
  controllers: [PointController],
})
export class PointModule {}
