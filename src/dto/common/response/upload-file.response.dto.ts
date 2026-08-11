export class UploadFileResponseDto {
    fileName!: string;
    originalName!: string;
    mimeType!: string;
    size!: number;
    url!: string;

    constructor(file: Express.Multer.File, baseUrl: string) {
        this.fileName = file.filename;
        this.originalName = file.originalname;
        this.mimeType = file.mimetype;
        this.size = file.size;
        this.url = `${baseUrl}/uploads/${file.filename}`;
    }
}
