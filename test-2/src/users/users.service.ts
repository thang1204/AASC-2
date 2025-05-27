// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-uset.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
    ) {}

    async create(dto: CreateUserDto) {
        const existing = await this.repo.findOne({ where: { username: dto.username } });
        if (existing) {
        throw new BadRequestException('Username đã tồn tại');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const user = this.repo.create({
        username: dto.username,
        password: hashedPassword,
        });
        return this.repo.save(user);
    }

    async findByUsername(username: string) {
        return this.repo.findOne({ where: { username } });
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.repo.findOneBy({ id });
        if (!user) throw new Error('User không tồn tại');

        Object.assign(user, dto);
        return this.repo.save(user);
    }
}

