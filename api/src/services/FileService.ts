import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MultipartFile } from "@fastify/multipart";


export interface IFileService {
  saveProposalFile(file: MultipartFile): Promise<string>;
}

export class FileService implements IFileService {
  private uploadFolder = path.resolve(__dirname, "../../uploads/proposals");
  private photoUploadFolder = path.resolve(__dirname, "../../uploads/project-photos");

  constructor() {
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
    if (!fs.existsSync(this.photoUploadFolder)) {
      fs.mkdirSync(this.photoUploadFolder, { recursive: true });
    }
  }

  async saveProposalFile(file: MultipartFile): Promise<string> {
    console.log("Iniciando upload:", file.filename);
    const ext = path.extname(file.filename);
    const uniqueName = crypto.randomUUID() + ext;
    const filePath = path.join(this.uploadFolder, uniqueName);
    
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      file.file
        .pipe(writeStream)
        .on("finish", () => resolve())
        .on("error", reject);
    });

    console.log("Upload finalizado:", filePath);
    return `/uploads/proposals/${uniqueName}`;
  }

  async saveProjectPhoto(file: MultipartFile): Promise<string> {
    console.log("Iniciando upload da foto:", file.filename);
    const ext = path.extname(file.filename);
    const uniqueName = crypto.randomUUID() + ext;
    const filePath = path.join(this.photoUploadFolder, uniqueName);
    
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      file.file
        .pipe(writeStream)
        .on("finish", () => resolve())
        .on("error", reject);
    });

    return `/uploads/project-photos/${uniqueName}`;
  }
  
  async deleteFile(fileUrl: string) {
    if (!fileUrl) return;
    const relativePath = fileUrl.startsWith("/uploads/") ? fileUrl.replace("/uploads/", "") : fileUrl;

    const filePath = path.join(
      relativePath.includes("proposals") ? this.uploadFolder : this.photoUploadFolder,
      path.basename(relativePath)
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Arquivo deletado: ${filePath}`);
    }
  }
}