import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/role-auth.decorator';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { EditUserDto } from './dto/edit-user.dto';
import { GuestUserDto } from './dto/guest-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 200, type: User })
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @ApiOperation({ summary: 'Create guest user.' })
  @ApiResponse({ status: 200, type: User })
  @UsePipes(ValidationPipe)
  @Post('create-guest')
  createGuest(@Body() userDto: GuestUserDto) {
    return this.usersService.createGuestUser(userDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Add role for user' })
  @ApiResponse({ status: 200 })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/add-role')
  addRole(@Body() dto: ChangeRoleDto) {
    return this.usersService.addRole(dto);
  }

  @ApiOperation({ summary: 'Edit user info' })
  @ApiResponse({ status: 200 })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/edit')
  editUserInfo(@Body() dto: EditUserDto) {
    return this.usersService.editUser(dto);
  }
}
