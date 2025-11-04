import crypto from "crypto";
import { MultipartFile } from "@fastify/multipart";
import { minioClient, BUCKETS } from "../lib/minio";
import { Readable } from "stream";

export interface IFileService {
  saveProposalFile(file: MultipartFile): Promise<string>;
  saveProjectPhoto(file: MultipartFile): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export class FileService implements IFileService {
  private getMinioUrl(bucketName: string, fileName: string): string {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    
    return `${protocol}://${endpoint}:${port}/${bucketName}/${fileName}`;
  }

  async saveProposalFile(file: MultipartFile): Promise<string> {
    const ext = file.filename.split('.').pop()?.toLowerCase() || 'pdf';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    
    // Converte o stream do arquivo para buffer
    const buffer = await file.toBuffer();
    
    // Faz upload para o MinIO
    await minioClient.putObject(
      BUCKETS.PROPOSALS,
      uniqueName,
      buffer,
      buffer.length,
      {
        'Content-Type': file.mimetype || 'application/pdf',
      }
    );

    return this.getMinioUrl(BUCKETS.PROPOSALS, uniqueName);
  }

  async saveProjectPhoto(file: MultipartFile): Promise<string> {
    const ext = file.filename.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    
    // Converte o stream do arquivo para buffer
    const buffer = await file.toBuffer();
    
    // Faz upload para o MinIO
    await minioClient.putObject(
      BUCKETS.PROJECTS,
      uniqueName,
      buffer,
      buffer.length,
      {
        'Content-Type': file.mimetype || 'image/jpeg',
      }
    );

    return this.getMinioUrl(BUCKETS.PROJECTS, uniqueName);
  }
  
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      // Extrai o bucket e o nome do arquivo da URL
      // Ex: http://localhost:9000/conecta-projects/abc-123.jpg
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/').filter(p => p);
      
      if (pathParts.length < 2) return;
      
      const bucketName = pathParts[0];
      const fileName = pathParts.slice(1).join('/');

      await minioClient.removeObject(bucketName, fileName);
      console.log(`✓ Arquivo deletado: ${bucketName}/${fileName}`);
    } catch (error) {
      console.error('Erro ao deletar arquivo do MinIO:', error);
    }
  }
}