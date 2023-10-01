import { Injectable, NotFoundException } from '@nestjs/common';
import { Attributes, Color, Material, Size } from './attribute.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddColorDto } from './dto/add-color.dto';
import { AddMaterialDto } from './dto/add-material.dto';
import { AddSizeDto } from './dto/add-size.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectModel(Attributes.name) private attributesModel: Model<Attributes>,
  ) {}

  async addColor(colorDto: AddColorDto) {
    const attributes = await this.getOrCreateAttributes();

    // Check if a color with the same name already exists
    const existingColor = attributes.colors.find(
      (c) => c.name === colorDto.name,
    );
    if (existingColor) {
      throw new NotFoundException(
        `Color with name '${colorDto.name}' already exists.`,
      );
    }

    const newColor: Color = {
      _id: new mongoose.Types.ObjectId(),
      name: colorDto.name,
      hexCode: colorDto.hexCode,
    };
    attributes.colors.push(newColor);
    return await attributes.save();
  }

  async getColors() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.colors; // Return the 'colors' array
  }

  async getColorById(colorId: string) {
    const attributes = await this.getOrCreateAttributes();
    const color = attributes.colors.find((c) => c._id.toString() === colorId);
    return color || null;
  }

  async addMaterial(dto: AddMaterialDto) {
    const attributes = await this.getOrCreateAttributes();

    // Check if a material with the same name already exists
    const existingMaterial = attributes.materials.find(
      (m) => m.name === dto.name,
    );
    if (existingMaterial) {
      throw new NotFoundException(
        `Material with name '${dto.name}' already exists.`,
      );
    }

    const newMaterial: Material = {
      _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
      name: dto.name,
    };

    attributes.materials.push(newMaterial);
    return await attributes.save();
  }

  async getMaterials() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.materials; // Return the 'materials' array
  }

  async getMaterialById(materialId: string) {
    const attributes = await this.getOrCreateAttributes();
    const material = attributes.materials.find(
      (m) => m._id.toString() === materialId,
    );
    return material || null;
  }

  async addSize(sizeDto: AddSizeDto) {
    const attributes = await this.getOrCreateAttributes();

    // Check if a size with the same name already exists
    const existingSize = attributes.sizes.find((s) => s.name === sizeDto.name);
    if (existingSize) {
      throw new NotFoundException(
        `Size with name '${sizeDto.name}' already exists.`,
      );
    }

    const newSize: Size = {
      _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
      name: sizeDto.name,
    };

    attributes.sizes.push(newSize);
    return await attributes.save();
  }

  async getSizes() {
    const attributes = await this.getOrCreateAttributes();
    return attributes.sizes; // Return the 'sizes' array
  }

  async getSizeById(sizeId: string) {
    const attributes = await this.getOrCreateAttributes();
    const size = attributes.sizes.find((s) => s._id.toString() === sizeId);
    return size || null;
  }

  async getAttributes() {
    return await this.getOrCreateAttributes();
  }

  async removeColor(colorId: string): Promise<void> {
    const attributes = await this.getOrCreateAttributes();
    attributes.colors = attributes.colors.filter(
      (c) => c._id.toString() !== colorId,
    );
    await attributes.save();
  }

  async removeMaterial(materialId: string): Promise<void> {
    const attributes = await this.getOrCreateAttributes();
    attributes.materials = attributes.materials.filter(
      (m) => m._id.toString() !== materialId,
    );
    await attributes.save();
  }

  async removeSize(sizeId: string): Promise<void> {
    const attributes = await this.getOrCreateAttributes();
    attributes.sizes = attributes.sizes.filter(
      (s) => s._id.toString() !== sizeId,
    );
    await attributes.save();
  }

  private async getOrCreateAttributes() {
    let attributes = await this.attributesModel.findOne().exec();

    // If no attributes exist, create a new one
    if (!attributes) {
      attributes = new this.attributesModel({});
      await attributes.save();
    }

    return attributes;
  }
}
