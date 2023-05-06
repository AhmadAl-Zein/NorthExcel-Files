import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './fileUpload/fileUpload.module';
import { FileUploadController } from './fileUpload/fileUpload.controller';
import { FileUploadService } from './fileUpload/fileUpload.service';

@Module({
  imports: [AuthModule, FileUploadModule],
  controllers: [AppController, FileUploadController],
  providers: [AppService, FileUploadService],
})
export class AppModule {}
