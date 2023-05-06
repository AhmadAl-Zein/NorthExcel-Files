import { Module } from '@nestjs/common';
import { FileUploadController } from './fileUpload.controller';
import { FileUploadService } from './fileUpload.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService]
})
export class FileUploadModule {}
