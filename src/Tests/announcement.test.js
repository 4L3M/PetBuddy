const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
  await pool.end();
});

describe('announcement table', () => {
  let announcementId, ownerId, animalId;

  beforeAll(async () => {
    // Tworzenie użytkownika i zwierzęcia do testów
    const ownerResult = await pool.query(
      `INSERT INTO user_details (name, surname, location, account_type, animal_type, user_photo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
      ['Emma', 'White', 'New York', 'standard', { type: 'Dog' }, 'user_photo.jpg']
    );
    ownerId = ownerResult.rows[0].user_id;

    const animalResult = await pool.query(
      `INSERT INTO animals (name, age, animal_type, breed, owner_id, info, animal_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING animal_id`,
      ['Max', 5, { type: 'Dog' }, 'Labrador', ownerId, 'Energetic dog', 'dog_photo.jpg']
    );
    animalId = animalResult.rows[0].animal_id;
  });

  it('should insert a new announcement', async () => {
    const result = await pool.query(
      `INSERT INTO announcement (name, announcement_type, location, added_at, active, text, owner_id, animal_type, animal_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING announcement_id`,
      ['Found Dog', 'found', 'Chicago', new Date(), true, 'Found a Labrador in the park.', ownerId, { type: 'Dog' }, animalId]
    );
    announcementId = result.rows[0].announcement_id;
    expect(announcementId).toBeDefined();
  });

  it('should retrieve the created announcement', async () => {
    const result = await pool.query(`SELECT * FROM announcement WHERE announcement_id = $1`, [announcementId]);
    expect(result.rows[0].name).toBe('Found Dog');
    expect(result.rows[0].active).toBe(true);
  });

  it('should update the announcement', async () => {
    const result = await pool.query(
      `UPDATE announcement SET active = $1 WHERE announcement_id = $2 RETURNING active`,
      [false, announcementId]
    );
    expect(result.rows[0].active).toBe(false);
  });

  it('should delete the announcement', async () => {
    const result = await pool.query(`DELETE FROM announcement WHERE announcement_id = $1 RETURNING announcement_id`, [announcementId]);
    expect(result.rows[0].announcement_id).toBe(announcementId);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM animals WHERE animal_id = $1`, [animalId]);
    await pool.query(`DELETE FROM user_details WHERE user_id = $1`, [ownerId]);
  });
});
