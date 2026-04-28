import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';

@Controller('movies')
@UseGuards(AuthGuard, RoleGuard)
export class MovieController {
  constructor(private movieService: MovieService) {}

  @Get()
  findMine(@Request() req: RequestWithUser) {
    return this.movieService.findAllByUser(req.user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  findAll() {
    return this.movieService.findAllAdmin();
  }

  @Get('admin/:userId')
  @Roles('ADMIN')
  findByUser(@Param('userId') userId: string) {
    return this.movieService.findAllByUserAdmin(userId);
  }

  @Post()
  create(@Request() req: RequestWithUser, @Body() dto: CreateMovieDto) {
    return this.movieService.create(req.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    return this.movieService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.movieService.remove(req.user.sub, id);
  }
}
