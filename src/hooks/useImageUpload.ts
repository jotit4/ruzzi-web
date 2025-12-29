import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  publicUrl: string;
  fileName: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File, 
    propertyId: string, 
    isPrimary: boolean = false,
    displayOrder: number = 0
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo JPEG, PNG, WebP y GIF están permitidos.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.');
      }

      // Create form data for edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);
      formData.append('isPrimary', isPrimary.toString());
      formData.append('displayOrder', displayOrder.toString());

      // Upload using edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/property-image-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const result = await response.json();
      return {
        url: result.data.image_url,
        publicUrl: result.url,
        fileName: result.data.alt_text || file.name
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (
    files: File[],
    propertyId: string
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file, propertyId, i === 0, i);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const bucketPath = pathParts.slice(pathParts.length - 2, -1).join('/');
      const fullPath = `${bucketPath}/${fileName}`;

      const { error } = await supabase.storage
        .from('property-images')
        .remove([fullPath]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploading,
    error
  };
}
