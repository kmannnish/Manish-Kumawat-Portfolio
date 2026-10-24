/**
 * Client-side helper for image processing:
 * 1. Validates size & mime type
 * 2. Extracts natural dimensions (width, height)
 * 3. Generates a tiny base64 blur placeholder
 */

export interface ProcessedImageResult {
  width: number
  height: number
  placeholder: string
  byteSize: number
  mimeType: string
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type}). Please use JPEG, PNG, WebP, AVIF, or SVG.`,
    }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed size is 10MB.`,
    }
  }

  return { valid: true }
}

export async function processImageFile(file: File): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const width = img.naturalWidth || 800
      const height = img.naturalHeight || 600

      // Generate 16px wide blur placeholder
      let placeholder = ''
      try {
        const canvas = document.createElement('canvas')
        const targetWidth = 16
        const targetHeight = Math.max(1, Math.round((16 * height) / width))
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          placeholder = canvas.toDataURL('image/jpeg', 0.5)
        }
      } catch (e) {
        console.warn('Could not generate canvas blur placeholder:', e)
      }

      URL.revokeObjectURL(objectUrl)

      resolve({
        width,
        height,
        placeholder,
        byteSize: file.size,
        mimeType: file.type,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to read image dimensions.'))
    }

    img.src = objectUrl
  })
}
