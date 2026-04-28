import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email ? 'Email déjà utilisé' : 'Ce nom est déjà pris',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const emailToken = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashed,
        emailToken,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, emailToken);

    return { message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailToken: token },
    });
    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailToken: null },
    });

    return { message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: code, twoFactorExpiry: expiry },
    });

    await this.mailService.sendTwoFactorCode(user.email, code);

    return { message: 'Un code de vérification a été envoyé à votre adresse email.' };
  }

  async verifyTwoFactor(dto: VerifyTwoFactorDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.twoFactorCode || !user.twoFactorExpiry) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    if (user.twoFactorCode !== dto.code) {
      throw new BadRequestException('Code invalide');
    }

    if (user.twoFactorExpiry < new Date()) {
      throw new BadRequestException('Code expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpiry: null },
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { access_token: token };
  }
}
