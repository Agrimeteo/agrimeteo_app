import crypto from 'crypto';
import { supabaseServiceClient } from '../config/supabase.js';

const BUCKET = 'plant_images';

const isValidImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};

const generateFilename = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${random}-${originalName}`;
};

const uploadPlantImage = async (file, userId) => {
  if (!supabaseServiceClient) {
    throw new Error('Supabase service client is not configured');
  }

  if (!isValidImage(file)) {
    throw new Error('Invalid image file. Must be JPEG/PNG/WEBP, max 5MB');
  }

  const sanitizedOriginalName = file.originalname.replace(/\s+/g, '-');
  const filename = `${userId}/${generateFilename(sanitizedOriginalName)}`;

  const { error } = await supabaseServiceClient.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseServiceClient.storage.from(BUCKET).getPublicUrl(filename);

  return {
    filename,
    publicUrl: data.publicUrl,
    bucket: BUCKET,
  };
};

const storageService = {
  uploadPlantImage,
};

export { uploadPlantImage };
export default storageService;
