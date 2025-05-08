import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
}
