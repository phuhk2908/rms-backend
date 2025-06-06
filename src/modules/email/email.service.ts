import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Staff } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend;
    private readonly fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
        this.fromEmail = this.configService.get<string>('MAIL_FROM') as string;
    }

    async sendAccountVerificationOtp(user: Staff, otp: string) {
        const subject = 'Chào mừng! Vui lòng xác thực tài khoản của bạn';
        this.logger.log(`Đang gửi OTP xác thực tài khoản tới ${user.email}`);
        console.log(this.fromEmail)
        try {
            const { data } = await this.resend.emails.send({
                from: this.fromEmail,
                to: user.email,
                subject: subject,
                html: `
          <p>Xin chào ${user.name || user.email},</p>
          <p>Cảm ơn bạn đã đăng ký. Mã OTP để xác thực tài khoản của bạn là:</p>
          <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center;">${otp}</h2>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
        `,
                text: `Xin chào ${user.name || user.email},\n\nCảm ơn bạn đã đăng ký. Mã OTP xác thực của bạn là: ${otp}\n\nMã này sẽ hết hạn sau 10 phút.\n`,
            });
            console.log(data)
            this.logger.log(`Đã gửi OTP xác thực thành công tới ${user.email}`);
        } catch (error) {
            this.logger.error(`Gửi email xác thực thất bại tới ${user.email}`, error);
        }
    }

    async sendPasswordResetOtp(user: Staff, otp: string) {
        const subject = 'Mã OTP đặt lại mật khẩu của bạn';
        this.logger.log(`Đang gửi OTP đặt lại mật khẩu tới ${user.email}`);
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: user.email,
                subject: subject,
                html: `
          <p>Xin chào ${user.name || user.email},</p>
          <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
          <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center;">${otp}</h2>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `,
                text: `Xin chào ${user.name || user.email},\n\nMã OTP để đặt lại mật khẩu của bạn là: ${otp}\n\nMã này sẽ hết hạn sau 10 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n`,
            });
            this.logger.log(`Đã gửi OTP đặt lại mật khẩu thành công tới ${user.email}`);
        } catch (error) {
            this.logger.error(`Gửi email đặt lại mật khẩu thất bại tới ${user.email}`, error);
        }
    }
}