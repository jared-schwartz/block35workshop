const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);

//create database tables
const createTables = async () => {
  await client.query(`DROP TABLE IF EXISTS favorites`);
  await client.query(`DROP TABLE IF EXISTS users`);
  await client.query(`DROP TABLE IF EXISTS products`);

  await client.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE products (
      id UUID PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE favorites (
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_favorites UNIQUE(product_id, user_id)
    );
  `);
};

//create a product
const createProduct = async ({ name }) => {
  const response = await client.query(
    `
      INSERT INTO products(id, name)
      VALUES ($1, $2)
      RETURNING id, name
    `,
    [uuid.v4(), name]
  );
  return response.rows[0];
};

// create a user with hashed password
const createUser = async ({ username, password }) => {
  const hash = await bcrypt.hash(password, 2);
  const response = await client.query(
    `
      INSERT INTO users(id, username, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, password
    `,
    [uuid.v4(), username, hash]
  );
  return response.rows[0];
};

// fetch all users
const fetchUsers = async () => {
  const response = await client.query(`
    SELECT id, username, password
    FROM users
  `);
  return response.rows;
};

// fetch all products
const fetchProducts = async () => {
  const response = await client.query(`
    SELECT id, name
    FROM products
  `);
  return response.rows;
};

// create a favorite
const createFavorite = async ({ user_id, product_id }) => {
  const response = await client.query(
    `
      INSERT INTO favorites(id, user_id, product_id)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, product_id
    `,
    [uuid.v4(), user_id, product_id]
  );
  return response.rows[0];
};

// fetch favorites by user
const fetchFavorites = async ({ user_id }) => {
  const response = await client.query(
    `
      SELECT id, user_id, product_id
      FROM favorites
      WHERE user_id = $1
    `,
    [user_id]
  );
  return response.rows;
};

// delete a favorite
const destroyFavorite = async ({ id, user_id }) => {
  const response = await client.query(
    `
      DELETE FROM favorites
      WHERE id = $1 AND user_id = $2
    `,
    [id, user_id]
  );
  return response;
};


module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
