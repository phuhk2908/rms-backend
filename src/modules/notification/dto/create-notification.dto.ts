import { ApiProperty } from '@nestjs/swagger';
import { NotificationPriority } from '@shared/enums/notification-priority.enum';
import { NotificationType } from '@shared/enums/notification-type.enum';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'The message of the notification' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'The type of the notification', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'The priority of the notification', enum: NotificationPriority, required: false })
  @IsOptional()
 @IsEnum(NotificationPriority)
  priority?: NotificationPriority;
}