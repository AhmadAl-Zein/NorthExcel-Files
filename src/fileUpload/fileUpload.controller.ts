import { Controller, UploadedFiles, Post, UseInterceptors, ParseFilePipeBuilder, HttpStatus, Response, Get, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createReadStream, readdirSync, readFileSync, statSync } from 'fs';
import JSZip from 'jszip';
import { diskStorage } from 'multer';
import path, { extname, join } from 'path';

// Only for testing
const USERNAME = 'AhmadAlZein';
const USER_ID = '12345';

const allowedExtensions = ['.docx', '.pdf', '.jpg', '.png'];
const limitSize = 5 * 1024 * 1024; //5 MB

@ApiTags('File/Folder Transfer')
@Controller('file')
export class FileUploadController {
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'You can upload multiple files',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', null, {
      storage: diskStorage({
        destination: `./uploads/${USERNAME}_${Date.now()}_${USER_ID}`,
        filename: (req, file, cb) => {
          return cb(null, `${file.originalname.split('.')[0]}_${Date.now()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (allowedExtensions.includes(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: limitSize,
      },
    }),
  )
  uploadFiles(
    @UploadedFiles()
    files,
  ) {
    return 'Files uploaded successfully';
  }

  @Get('download')
  @ApiOperation({
    summary: 'pathName is folder name/file name',
  })
  @ApiResponse({
    description: 'Download this file',
  })
  downloadFile(@Response() res, @Query('pathName') pathName: string) {
    const filePath = `./uploads/${pathName}`; // replace with the path to your file
    const stat = statSync(filePath);
    const fileStream = createReadStream(filePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${pathName}`);
    res.setHeader('Content-Length', stat.size.toString());

    fileStream.pipe(res);
  }

  @Get('download-folder')
  @ApiResponse({
    description: 'Download this zip file',
  })
  async downloadFolder(@Response() res, @Query('folderName') folderName: string) {
    const folderPath = `./uploads/${folderName}`; // replace with the path to your folder
    const archiveName = `${USERNAME}_${Date.now()}_${USER_ID}.zip`;

    const zip = new JSZip();
    const files = readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileContent = readFileSync(filePath);
      zip.file(file, fileContent);
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${archiveName}`);
    res.status(200).send(zipContent);
  }
}
