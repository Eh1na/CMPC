// src/initialization/initialization.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BooksService } from 'src/books/books.service';

@Injectable()
export class InitializationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly booksService: BooksService,
  ) { }

  async onApplicationBootstrap() {
    await this.createAdminUser();
    await this.createInitialBooks();
  }

  private async createAdminUser() {
    const adminUsername = this.configService.get('ADMIN_USERNAME') || 'admin';
    const adminPassword = this.configService.get('ADMIN_PASSWORD') || 'AdminSecure123!';

    try {
      const existingAdmin = await this.usersService.findByUsername(adminUsername);

      if (!existingAdmin) {
        // Usamos el servicio de usuarios para garantizar el hash correcto
        await this.usersService.register({
          username: adminUsername,
          password: adminPassword
        });
        this.logger.log('Usuario admin creado exitosamente');
      }
    } catch (error) {
      this.logger.error(`Error al crear usuario admin: ${error.message}`);
      // Intento alternativo para desarrollo
      await this.tryAlternativeAdminCreation(adminUsername, adminPassword);
    }
  }

  private async tryAlternativeAdminCreation(username: string, password: string) {
    try {
      const existing = await this.usersService.findByUsername(username);
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.usersService['userModel'].create({
          username,
          password: hashedPassword
        });
        this.logger.warn('Usuario admin creado con método alternativo');
      }
    } catch (altError) {
      this.logger.error(`Método alternativo falló: ${altError.message}`);
    }
  }

  private async createInitialBooks() {
    try {
      const result = await this.booksService.generateInitialBooks();
      this.logger.log(result.message);
    } catch (error) {
      this.logger.error('Error al crear libros iniciales:', error.message);
    }
  }

}