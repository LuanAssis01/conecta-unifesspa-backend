import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MultipartFile } from "@fastify/multipart";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface IFileService {
  saveProposalFile(file: MultipartFile): Promise<string>;
  saveProjectPhoto(file: MultipartFile): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class FileService implements IFileService {
  private uploadFolder = path.resolve(__dirname, "../../uploads/proposals");

  constructor() {
    // Manter pasta local apenas para PDFs
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
  }

  async saveProposalFile(file: MultipartFile): Promise<string> {
    console.log("Iniciando upload de proposta:", file.filename);
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

    console.log("Upload de proposta finalizado:", filePath);
    return `/uploads/proposals/${uniqueName}`;
  }

  async saveProjectPhoto(file: MultipartFile): Promise<string> {
    console.log("Iniciando upload de imagem para Cloudinary:", file.filename);
    
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "conecta-unifesspa/projects",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) {
            console.error("Erro no upload para Cloudinary:", error);
            reject(error);
          } else if (result) {
            console.log("Upload para Cloudinary concluído:", result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error("Resultado do upload é undefined"));
          }
        }
      );

      // Converter o stream do arquivo para o Cloudinary
      if (file.file instanceof Readable) {
        file.file.pipe(uploadStream);
      } else {
        reject(new Error("Arquivo não é um stream válido"));
      }
    });
  }
  
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    // Se for uma URL do Cloudinary
    if (fileUrl.includes("cloudinary.com")) {
      try {
        // Extrair o public_id da URL
        const urlParts = fileUrl.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `conecta-unifesspa/projects/${fileWithExt.split(".")[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Imagem deletada do Cloudinary: ${publicId}`);
      } catch (error) {
        console.error("Erro ao deletar imagem do Cloudinary:", error);
      }
      return;
    }

    // Se for arquivo local (PDF)
    if (fileUrl.startsWith("/uploads/proposals/")) {
      const relativePath = fileUrl.replace("/uploads/proposals/", "");
      const filePath = path.join(this.uploadFolder, relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Arquivo local deletado: ${filePath}`);
      }
    }
  }
}