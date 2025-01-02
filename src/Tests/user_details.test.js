const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
  await pool.end();
});

describe('user_details table', () => {
  let userId;

  it('should insert a new user', async () => {
    const result = await pool.query(
      `INSERT INTO user_details (name, surname, location, account_type, animal_type, user_photo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
      ['Alice', 'Smith', 'Los Angeles', 'premium', { type: 'Cat' }, 'user_photo.jpg']
    );
    userId = result.rows[0].user_id;
    expect(userId).toBeDefined();
  });

  it('should retrieve the created user', async () => {
    const result = await pool.query(`SELECT * FROM user_details WHERE user_id = $1`, [userId]);
    expect(result.rows[0].name).toBe('Alice');
    expect(result.rows[0].location).toBe('Los Angeles');
  });

  it('should update the user', async () => {
    const result = await pool.query(
      `UPDATE user_details SET location = $1 WHERE user_id = $2 RETURNING location`,
      ['San Francisco', userId]
    );
    expect(result.rows[0].location).toBe('San Francisco');
  });

  it('should delete the user', async () => {
    const result = await pool.query(`DELETE FROM user_details WHERE user_id = $1 RETURNING user_id`, [userId]);
    expect(result.rows[0].user_id).toBe(userId);
  });
});
