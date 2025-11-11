const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/**
 * Upload ảnh từ đối tượng File (web) lên Cloudinary.
 * @param file Đối tượng File (thường lấy từ <input type="file">).
 * @returns Promise<string> URL công khai của ảnh đã upload.
 */
export async function uploadImageToCloudinary(file: File | Blob | string): Promise<string> {
  try {
    // If caller passes a string (already a URL), just return it
    if (typeof file === 'string') {
      return file;
    }

    const fileToUpload: File | Blob = file;

    const formData = new FormData();
    // FormData accepts Blob or File
    formData.append('file', fileToUpload as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'product_reviews');

    const fileName = (fileToUpload as File & { name?: string }).name || 'blob';
    console.log('FormData created (Web/File-based):', {
      fileName,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      folder: 'product_reviews',
      cloudName: CLOUDINARY_CLOUD_NAME,
      url: CLOUDINARY_UPLOAD_URL,
    });

    // Test connection (vẫn giữ lại, không ảnh hưởng)
    try {
      const testURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/ping`;
      console.log('Testing connection to:', testURL);
      const testResponse = await fetch(testURL);
      console.log('Connection test status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('Connection test response:', testData);
    } catch (err) {
      console.error('Connection test failed:', err);
    }

    // 4. Gửi POST request bằng fetch
    console.log('Uploading to:', CLOUDINARY_UPLOAD_URL);

    const uploadRes = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      // Khi dùng FormData, trình duyệt sẽ tự động
      // đặt 'Content-Type' là 'multipart/form-data' với boundary
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      console.error('Upload failed with status:', uploadRes.status);
      console.error('Error details:', errorData);
      throw new Error(
        `Upload failed: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await uploadRes.json();

    if (data.secure_url) {
      console.log('Upload success:', data.secure_url);
      return data.secure_url; // URL HTTPS an toàn
    } else {
      throw new Error('Upload failed: No secure_url');
    }
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    if (err instanceof Error) {
      console.log('Error message:', err.message);
    }
    throw err;
  }
}