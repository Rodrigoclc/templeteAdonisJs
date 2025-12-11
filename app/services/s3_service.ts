import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '#start/env'
class S3Service {
  private s3Client: S3Client
  private bucket: string

  constructor() {
    // Initialize S3 Client
    this.s3Client = new S3Client({
      region: env.get('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    })

    this.bucket = env.get('AWS_S3_BUCKET', '')
  }

  /**
   * Upload a file to S3
   */
  async uploadFile({
    base64,
    key,
    contentType,
    metadata = {},
    acl = 'private',
  }: {
    base64: string
    key: string
    contentType: string
    metadata?: Record<string, string>
    acl?: PutObjectCommandInput['ACL']
  }): Promise<string> {
    try {
      const base64Data = base64!.split(';base64,').pop()!
      const fileBuffer = Buffer.from(base64Data, 'base64')

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: { ...metadata, acl },
        ACL: acl,
      })

      await this.s3Client.send(command)

      // Return the public URL of the uploaded file
      return `https://${this.bucket}.s3.${env.get('AWS_REGION', 'us-east-1')}.amazonaws.com/${key}`
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      throw error
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await this.s3Client.send(command)
    } catch (error) {
      console.error('Error deleting file from S3:', error)
      throw error
    }
  }

  /**
   * Generate a presigned URL for temporary file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const url = await getSignedUrl(this.s3Client, command, { expiresIn })
      return url
    } catch (error) {
      console.error('Error generating presigned URL:', error)
      throw error
    }
  }

  /**
   * Generate a unique file key based on folder and original filename
   */
  generateFileKey(folder: string, originalFilename: string, id?: number | string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalFilename.split('.').pop()
    const baseName = originalFilename.split('.').slice(0, -1).join('.')

    let fileName = `${baseName}_${timestamp}_${randomString}.${extension}`
    if (id) {
      fileName = `${id}_${fileName}`
    }

    return `${folder}/${fileName}`
  }

  /**
   * Upload a photo (with specific handling for images)
   */
  async uploadPhoto(
    base64: string,
    folder: string,
    originalFilename: string,
    id?: number | string
  ): Promise<string> {
    const key = this.generateFileKey(`fleetpro/photos/${folder}`, originalFilename, id)
    return this.uploadFile({ base64, key, contentType: 'image/jpeg', acl: 'public-read' })
  }

  /**
   * Upload a document/file
   */
  async uploadDocument(
    base64: string,
    folder: string,
    originalFilename: string,
    id?: number | string
  ): Promise<string> {
    const key = this.generateFileKey(`fleetpro/${folder}`, originalFilename, id)
    return this.uploadFile({
      base64,
      key,
      contentType: 'application/octet-stream',
      acl: 'public-read',
    })
  }

  /**
   * Extract file key from S3 URL
   */
  extractKeyFromUrl(url: string): string {
    const match = url.match(/amazonaws\.com\/(.+)$/)
    return match ? match[1] : ''
  }
}

export default new S3Service()
