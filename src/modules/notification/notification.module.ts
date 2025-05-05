import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
   imports: [
      MailerModule.forRootAsync({
         useFactory: async (config: ConfigService) => ({
            transport: {
               host: config.get('MAIL_HOST'),
               secure: false,
               auth: {
                  user: config.get('MAIL_USER'),
                  pass: config.get('MAIL_PASSWORD'),
               },
            },
            defaults: {
               from: `"Restaurant Management" <${config.get('MAIL_FROM')}>`,
            },
         }),
         inject: [ConfigService],
      }),
   ],
   providers: [NotificationService],
   exports: [NotificationService],
})
export class NotificationModule {}
