const { createClient } = require('@supabase/supabase-js')
const { HttpError } = require('../utils/httpError')

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY
  if (!url || !key) {
    throw new HttpError({
      statusCode: 500,
      code: 'CONFIG_ERROR',
      error: 'ConfigError',
      message: 'Supabase is not configured',
    })
  }
  return createClient(url, key)
}

async function uploadFile({ bucket, path, buffer, contentType }) {
  const supabase = getClient()
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  })
  if (error) {
    throw new HttpError({ statusCode: 500, code: 'UPLOAD_FAILED', error: 'UploadFailed', message: error.message })
  }
  return { bucket, path }
}

async function getPublicUrl({ bucket, path }) {
  const supabase = getClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new HttpError({ statusCode: 500, code: 'UPLOAD_FAILED', error: 'UploadFailed', message: 'Unable to get public URL' })
  }
  return data.publicUrl
}

async function createSignedUrl({ bucket, path, expiresIn = 3600 }) {
  const supabase = getClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) {
    throw new HttpError({ statusCode: 500, code: 'UPLOAD_FAILED', error: 'UploadFailed', message: error.message })
  }
  if (!data?.signedUrl) {
    throw new HttpError({ statusCode: 500, code: 'UPLOAD_FAILED', error: 'UploadFailed', message: 'Unable to create signed URL' })
  }
  return data.signedUrl
}

module.exports = {
  uploadFile,
  getPublicUrl,
  createSignedUrl,
}
