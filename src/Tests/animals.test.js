const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
  await pool.end();
});

describe('animals table', () => {
  let animalId, ownerId;

  beforeAll(async () => {
    // Dodanie testowego użytkownika jako właściciela
    const ownerResult = await pool.query(
      `INSERT INTO user_details (name, surname, location, account_type, animal_type, user_photo) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
      ['John', 'Doe', 'New York', 'standard', { type: 'Dog' }, 'user_photo.jpg']
    );
    ownerId = ownerResult.rows[0].user_id;
  });

  it('should insert a new animal', async () => {
    const result = await pool.query(
      `INSERT INTO animals (name, age, animal_type, breed, owner_id, info, animal_photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING animal_id`,
      ['Buddy', 3, { type: 'Dog' }, 'Golden Retriever', ownerId, 'Friendly dog', 'dog_photo.jpg']
    );
    animalId = result.rows[0].animal_id;
    expect(animalId).toBeDefined();
  });

  it('should retrieve the created animal', async () => {
    const result = await pool.query(`SELECT * FROM animals WHERE animal_id = $1`, [animalId]);
    expect(result.rows[0].name).toBe('Buddy');
    expect(result.rows[0].age).toBe(3);
  });

  it('should update the animal', async () => {
    const result = await pool.query(
      `UPDATE animals SET age = $1 WHERE animal_id = $2 RETURNING age`,
      [4, animalId]
    );
    expect(result.rows[0].age).toBe(4);
  });

  it('should delete the animal', async () => {
    const result = await pool.query(`DELETE FROM animals WHERE animal_id = $1 RETURNING animal_id`, [animalId]);
    expect(result.rows[0].animal_id).toBe(animalId);
  });

  afterAll(async () => {
    // Usuwanie testowego użytkownika
    await pool.query(`DELETE FROM user_details WHERE user_id = $1`, [ownerId]);
  });
});
