import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as Excel from 'exceljs';

@Injectable()
export class ImportProductsService {
  async parseExelFile(files: [any]): Promise<ExelProduct[]> {
    const workbook = new Excel.Workbook();
    if (!files) {
      throw new HttpException(
        'File for parsing should be present',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log(files);
    const content = await workbook.xlsx.load(files[0].buffer);

    const worksheet = content.worksheets[0];
    const rowStartIndex = 2;
    const numberOfRows = worksheet.rowCount;

    const rows = worksheet.getRows(rowStartIndex, numberOfRows) ?? [];
    const regExp = /\(([^)]+)\)/g;

    const products = rows.map((row): ExelProduct => {
      let name = getCellValue(row, 2);
      const idName = getCellValue(row, 3);
      const matches = name.match(regExp);
      let color = undefined;
      if (matches) {
        color = matches[0];
        color = capitalizeFirstLetter(color.replace('(', '').replace(')', ''));
        if (color == 'Beg') {
          color = 'Beige';
        }
        if (color == 'Pink leo') {
          color = 'PinkLeo';
        }
        if (color == 'Lil') {
          color = 'Purple';
        }
        if (color == 'Gray') {
          color = 'Grey';
        }
        name = name.substring(0, name.indexOf('(') - 1);
      }
      if (!color) {
        color = 'Unified';
      }
      return {
        name: name,
        idName: idName,
        price: +getCellValue(row, 5),
        costPrice: +getCellValue(row, 9),
        warehouseQuantity: +getCellValue(row, 10),
        color: color,
      };
    });
    return products;
  }
}

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex);

  return cell.value ? cell.value.toString() : '';
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

type ExelProduct = {
  name: string;
  idName: string;
  price: number;
  costPrice: number;
  warehouseQuantity: number;
  color: string;
};
