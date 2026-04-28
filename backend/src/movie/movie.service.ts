import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.movie.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
    });
  }

  findAllByUserAdmin(userId: string) {
    return this.prisma.movie.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      include: { user: { select: { id: true, email: true, username: true } } },
    });
  }

  findAllAdmin() {
    return this.prisma.movie.findMany({
      orderBy: { watchedAt: 'desc' },
      include: { user: { select: { id: true, email: true, username: true } } },
    });
  }

  create(userId: string, dto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, id: string, dto: UpdateMovieDto) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Film introuvable');
    if (movie.userId !== userId) throw new ForbiddenException();

    return this.prisma.movie.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Film introuvable');
    if (movie.userId !== userId) throw new ForbiddenException();

    return this.prisma.movie.delete({ where: { id } });
  }
}
