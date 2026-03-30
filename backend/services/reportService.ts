import { supabaseServiceClient } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

export const createReport = async (userId: string, imageFile: Express.Multer.File, description: string) => {
      // Save temp file
      
      const fileName = `${Date.now()}-${imageFile.originalname}`;
      const tempPath = path.join(__dirname, '..', 'temp', fileName);
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      fs.writeFileSync(tempPath, imageFile.buffer);
      // Upload to Supabase Storage
      
      const { data, error } = await supabaseServiceClient.storage
      .from('plant_images')
      .upload(fileName, fs.readFileSync(tempPath), {
         contentType: imageFile.mimetype,
      upsert: true
    });

  fs.unlinkSync(tempPath);

  if (error) throw new Error(error.message);

  // Save metadata
  const { data: report, error: reportError } = await supabaseServiceClient
    .from('reports')
    .insert({
      user_id: userId,
      image_url: `https://your-project.supabase.co/storage/v1/object/public/plant_images/${fileName}`,
      description,
      status: 'pending'
    })
    .select()
    .single();

  if (reportError) throw new Error(reportError.message);

  return report;
};
