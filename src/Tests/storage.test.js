const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

describe('photos bucket', () => {
  it('should upload a photo to the bucket', async () => {
    const { data, error } = await supabase.storage
      .from('photos')
      .upload('test_photo.jpg', Buffer.from('test file content'), {
        contentType: 'image/jpeg',
      });
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should retrieve the uploaded photo', async () => {
    const { data, error } = await supabase.storage.from('photos').download('test_photo.jpg');
    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Blob); // lub Buffer w Node.js
  });

  it('should delete the photo from the bucket', async () => {
    const { data, error } = await supabase.storage.from('photos').remove(['test_photo.jpg']);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
