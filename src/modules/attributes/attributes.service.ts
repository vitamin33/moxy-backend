import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Attributes,
  AttributesWithCategories,
  Color,
  Material,
  Size,
} from './attribute.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddColorDto } from './dto/add-color.dto';
import { AddMaterialDto } from './dto/add-material.dto';
import { AddSizeDto } from './dto/add-size.dto';
import { ProductCategory } from '../products/product.entity';
import { ActivateHomeMediaDto } from '../settings/dto/activate-home-media.dto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AttributesService {
  constructor(
    @InjectModel(Color.name) private colorModel: Model<Color>,
    @InjectModel(Size.name) private sizeModel: Model<Size>,
    @InjectModel(Material.name) private materialModel: Model<Material>,
    private settingsService: SettingsService,
  ) {}

  async addColor(colorDto: AddColorDto) {
    const existingColor = await this.colorModel
      .findOne({ name: colorDto.name })
      .exec();

    if (existingColor) {
      throw new NotFoundException(
        `Color with name '${colorDto.name}' already exists.`,
      );
    }

    const newColor = new this.colorModel({
      name: colorDto.name,
      hexCode: colorDto.hexCode,
    });

    return await newColor.save();
  }

  async getColors() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.colors; // Return the 'colors' array
  }

  async addMaterial(dto: AddMaterialDto) {
    const existingMaterial = await this.materialModel
      .findOne({ name: dto.name })
      .exec();

    if (existingMaterial) {
      throw new NotFoundException(
        `Material with name '${dto.name}' already exists.`,
      );
    }

    const newMaterial = new this.materialModel({
      name: dto.name,
    });

    return await newMaterial.save();
  }

  async addSize(sizeDto: AddSizeDto) {
    const existingSize = await this.sizeModel
      .findOne({ name: sizeDto.name })
      .exec();

    if (existingSize) {
      throw new NotFoundException(
        `Size with name '${sizeDto.name}' already exists.`,
      );
    }

    const newSize = new this.sizeModel({
      name: sizeDto.name,
    });

    return await newSize.save();
  }

  async getMaterials() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.materials; // Return the 'materials' array
  }

  async getSizes() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.sizes; // Return the 'sizes' array
  }

  async getColorById(colorId: string) {
    const color = await this.colorModel.findById(colorId).exec();
    return color || null;
  }

  async getMaterialById(materialId: string) {
    const material = await this.materialModel.findById(materialId).exec();
    return material || null;
  }

  async getSizeById(sizeId: string) {
    const size = await this.sizeModel.findById(sizeId).exec();
    return size || null;
  }

  async getAttributes(): Promise<AttributesWithCategories> {
    const attributes = await this.getOrCreateAttributes();
    const productCategories = Object.values(ProductCategory);
    const homeMedia = this.settingsService.getHomeMedia();

    // Create an object that includes attributes and productCategories
    const result: any = {
      ...attributes, // Include all properties from attributes
      productCategories,
      homeMedia,
    };

    return result;
  }

  async removeColor(colorId: string): Promise<void> {
    await this.colorModel.deleteOne({ _id: colorId }).exec();
  }

  async removeMaterial(materialId: string): Promise<void> {
    await this.materialModel.deleteOne({ _id: materialId }).exec();
  }

  async removeSize(sizeId: string): Promise<void> {
    await this.sizeModel.deleteOne({ _id: sizeId }).exec();
  }

  private async getOrCreateAttributes() {
    const attributes: Attributes = {
      colors: [],
      materials: [],
      sizes: [],
    };

    // Populate colors, materials, and sizes
    attributes.colors = await this.colorModel.find().exec();
    attributes.materials = await this.materialModel.find().exec();
    attributes.sizes = await this.sizeModel.find().exec();

    return attributes;
  }
}
