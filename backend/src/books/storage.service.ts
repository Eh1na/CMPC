import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly uploadPath = path.join(__dirname, '..', '..', 'uploads', 'books');
  private readonly publicPath = '/images';

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveBookImage(file: Express.Multer.File): Promise<string> {
    if (!file) throw new Error('No se proporcionó archivo');


    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new Error('Tipo de archivo no soportado');
    }


    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadPath, fileName);


    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toFile(filePath);


    return `${this.publicPath}/${fileName}`;
  }

  async deleteBookImage(imageUrl: string | null): Promise<void> {
    if (!imageUrl) return;

    try {

      const fileName = imageUrl.includes('/images/')
        ? path.basename(imageUrl.split('/images/').pop() || '')
        : path.basename(imageUrl);

      const filePath = path.join(this.uploadPath, fileName);


      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new InternalServerErrorException('Error al eliminar la imagen');
    }
  }

  getFullImagePath(imageUrl: string | null): string | null {
    if (!imageUrl) return null;
    return path.join(this.uploadPath, path.basename(imageUrl));
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      throw new BadRequestException('No se proporcionó URL de imagen');
    }

    try {

      const fileName = this.extractFileNameFromUrl(imageUrl);
      const filePath = path.join(this.uploadPath, fileName);


      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('La imagen no existe en el servidor');
      }
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw new InternalServerErrorException('Error al eliminar la imagen');
    }
  }

  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return path.basename(urlObj.pathname);
    } catch {
      return path.basename(url.split('/images/').pop() || '');
    }
  }


}