import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
});

// Nome do bucket padrão para o projeto
export const BUCKETS = {
  PROJECTS: 'conecta-projects',
  PROPOSALS: 'conecta-proposals',
} as const;

// Função para garantir que os buckets existem
export async function ensureBucketsExist() {
  try {
    for (const bucketName of Object.values(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName);
      
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`✓ Bucket '${bucketName}' criado com sucesso`);
        
        // Define política pública de leitura para o bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`✓ Política pública configurada para '${bucketName}'`);
      }
    }
  } catch (error) {
    console.error('Erro ao configurar buckets do MinIO:', error);
    throw error;
  }
}
