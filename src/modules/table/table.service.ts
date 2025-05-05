import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableStatus } from '@shared/enums/table-status.enum';

@Injectable()
export class TableService {
   constructor(
      @InjectRepository(Table)
      private readonly tableRepository: Repository<Table>,
   ) {}

   async create(createTableDto: CreateTableDto): Promise<Table> {
      const table = this.tableRepository.create(createTableDto);
      return this.tableRepository.save(table);
   }

   async findAll(): Promise<Table[]> {
      return this.tableRepository.find();
   }

   async findAvailable(): Promise<Table[]> {
      return this.tableRepository.find({
         where: { status: TableStatus.AVAILABLE },
      });
   }

   async findOne(id: string): Promise<Table> {
      const table = await this.tableRepository.findOne({ where: { id } });
      if (!table) {
         throw new NotFoundException('Table not found');
      }
      return table;
   }

   async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
      const table = await this.findOne(id);
      return this.tableRepository.save({ ...table, ...updateTableDto });
   }

   async updateStatus(id: string, status: TableStatus): Promise<Table> {
      const table = await this.findOne(id);
      table.status = status;
      return this.tableRepository.save(table);
   }

   async remove(id: string): Promise<void> {
      const table = await this.findOne(id);
      await this.tableRepository.remove(table);
   }
}
