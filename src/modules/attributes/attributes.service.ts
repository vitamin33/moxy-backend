import { Injectable } from '@nestjs/common';
import { Attributes } from './attribute.entity';
import { Model } from 'mongoose';
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
    const newColor = new this.attributesModel({
      colors: [colorDto], // Add the color to the 'colors' array
    });
    return await newColor.save();
  }

  async removeColor(colorId: string): Promise<void> {
    await this.attributesModel
      .updateOne(
        { 'colors._id': colorId },
        { $pull: { colors: { _id: colorId } } },
      )
      .exec();
  }

  async getColors() {
    const attributes = await this.attributesModel.findOne().exec();
    return attributes.colors; // Return the 'colors' array
  }

  async getColorById(colorId: string) {
    const attributes = await this.attributesModel.findOne().exec();
    const color = attributes.colors.find((c) => c._id.toString() === colorId);
    return color || null;
  }

  async addMaterial(dto: AddMaterialDto) {
    const newMaterial = new this.attributesModel({
      materials: [dto], // Add the color to the 'materials' array
    });
    return await newMaterial.save();
  }

  async getMaterials() {
    const attributes = await this.attributesModel.findOne().exec();
    return attributes.materials; // Return the 'materials' array
  }

  async getMaterialById(materialId: string) {
    const attributes = await this.attributesModel.findOne().exec();
    const material = attributes.materials.find(
      (m) => m._id.toString() === materialId,
    );
    return material || null;
  }

  async removeMaterial(materialId: string): Promise<void> {
    await this.attributesModel
      .updateOne(
        { 'materials._id': materialId },
        { $pull: { materials: { _id: materialId } } },
      )
      .exec();
  }

  async addSize(sizeDto: AddSizeDto) {
    const newSize = new this.attributesModel({
      sizes: [sizeDto], // Add the size to the 'sizes' array
    });
    return await newSize.save();
  }

  async removeSize(sizeId: string): Promise<void> {
    await this.attributesModel
      .updateOne({ 'sizes._id': sizeId }, { $pull: { sizes: { _id: sizeId } } })
      .exec();
  }

  async getSizes() {
    const attributes = await this.attributesModel.findOne().exec();
    return attributes.sizes; // Return the 'sizes' array
  }

  async getSizeById(sizeId: string) {
    const attributes = await this.attributesModel.findOne().exec();
    const size = attributes.sizes.find((s) => s._id.toString() === sizeId);
    return size || null;
  }
}
