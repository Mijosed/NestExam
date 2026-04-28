import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

@Module({
  imports: [AuthModule],
  controllers: [MovieController],
  providers: [MovieService, PrismaService],
})
export class MovieModule {}
