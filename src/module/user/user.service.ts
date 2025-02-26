import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/lib/entity/user/user.entity';
import { ResponseBase } from 'src/lib/shared/constant/response_base';
import { BcryptService } from '../auth/service/bcrypt.service';
import { RefreshToken } from 'src/lib/entity/user/refresh-token.entity';
import { access } from 'fs';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { PaginationResult } from 'src/lib/shared/interface/pagination-result.interface';
import { PaginationService } from 'src/lib/shared/service/pagination.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (findUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const user = new User();
      user.name = createUserDto.name;
      user.email = createUserDto.email;
      user.password = await this.bcryptService.hashPassword(
        createUserDto.password,
      );
      user.role = createUserDto.role as UserRole;
      return this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['userId', 'name', 'email', 'password', 'role'],
      });
      if (user != null) {
        return user;
      } else {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      console.log('error ', e);
      throw new HttpException(`${e.message}`, HttpStatus.BAD_REQUEST);
    }
  }
  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<User>> {
    return await this.paginationService.paginate<User>(
      this.userRepository,
      paginationDto,
    );
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId: id.toString() },
      });
      if (user != null) {
        return user;
      }
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
