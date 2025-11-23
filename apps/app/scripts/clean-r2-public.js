#!/usr/bin/env node
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
]

// Verify environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME
const PUBLIC_PREFIX = 'public/'

async function listObjectsWithPrefix(prefix) {
  const objects = []
  let continuationToken = undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000
    })

    try {
      const response = await s3Client.send(command)
      
      if (response.Contents) {
        objects.push(...response.Contents)
      }
      
      continuationToken = response.NextContinuationToken
    } catch (error) {
      console.error('❌ Error listing objects:', error.message)
      throw error
    }
  } while (continuationToken)

  return objects
}

async function deleteObjects(objects) {
  if (objects.length === 0) {
    return
  }

  // S3 batch delete supports max 1000 objects at a time
  const chunks = []
  for (let i = 0; i < objects.length; i += 1000) {
    chunks.push(objects.slice(i, i + 1000))
  }

  for (const chunk of chunks) {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: chunk.map(obj => ({ Key: obj.Key })),
        Quiet: false
      }
    }

    try {
      const command = new DeleteObjectsCommand(deleteParams)
      const response = await s3Client.send(command)
      
      if (response.Deleted) {
        console.log(`✅ Deleted ${response.Deleted.length} objects`)
      }
      
      if (response.Errors && response.Errors.length > 0) {
        console.warn(`⚠️ Errors deleting some objects:`)
        response.Errors.forEach(error => {
          console.warn(`   - ${error.Key}: ${error.Message}`)
        })
      }
    } catch (error) {
      console.error(`❌ Error deleting batch:`, error.message)
      throw error
    }
  }
}

async function main() {
  console.log(`🧹 Starting R2 cleanup for bucket: ${BUCKET_NAME}`)
  console.log(`📁 Target prefix: ${PUBLIC_PREFIX}`)
  console.log('')

  try {
    // List all objects with "public/" prefix
    console.log(`🔍 Listing objects with prefix "${PUBLIC_PREFIX}"...`)
    const objects = await listObjectsWithPrefix(PUBLIC_PREFIX)
    
    if (objects.length === 0) {
      console.log('✅ No objects found to delete')
      return
    }

    console.log(`📦 Found ${objects.length} objects to delete`)
    
    // Show some examples of what will be deleted
    console.log('📋 Examples of objects to be deleted:')
    objects.slice(0, 10).forEach(obj => {
      const sizeKB = Math.round((obj.Size || 0) / 1024)
      console.log(`   - ${obj.Key} (${sizeKB} KB)`)
    })
    
    if (objects.length > 10) {
      console.log(`   ... and ${objects.length - 10} more`)
    }
    console.log('')

    // Calculate total size
    const totalSize = objects.reduce((sum, obj) => sum + (obj.Size || 0), 0)
    const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100
    console.log(`📊 Total size to delete: ${totalSizeMB} MB`)
    console.log('')

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete all objects in the "public/" folder!')
    console.log('Press Ctrl+C to cancel, or any key to continue...')
    
    // Wait for user input
    process.stdin.setRawMode(true)
    process.stdin.resume()
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        resolve()
      })
    })

    console.log('')
    console.log('🗑️ Starting deletion...')
    
    await deleteObjects(objects)
    
    console.log('')
    console.log(`✅ Successfully cleaned ${objects.length} objects from R2 bucket`)
    console.log(`💾 Freed up ${totalSizeMB} MB of storage`)
    
  } catch (error) {
    console.error('')
    console.error('❌ Script failed:', error.message)
    process.exit(1)
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('')
  console.log('👋 Operation cancelled by user')
  process.exit(0)
})

main()