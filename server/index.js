const {
    client,
    createTables,
    createProduct,
    createUser,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    destroyFavorite,
  } = require("./db");
  
  const express = require("express");
  const morgan = require("morgan");
  
  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));
  
 
  app.get("/api/users", async (req, res, next) => {
    try {
      const users = await fetchUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await fetchProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
      const favorites = await fetchFavorites({ user_id: req.params.id });
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
      const favorite = await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      });
      res.json(favorite);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/users/:id/favorites/:favorite_id", async (req, res, next) => {
    try {
      await destroyFavorite({
        user_id: req.params.id,
        id: req.params.favorite_id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  

  const init = async () => {
    try {
      console.log("Connecting to the database...");
      await client.connect();
      console.log("Connected to the database.");
  
      console.log("Creating tables...");
      await createTables();

      const products = await Promise.all(
        ["Milk ", "pan", "chair", "eggs", "house", "bin"].map((name) =>
          createProduct({ name })
        )
      );

      const users = await Promise.all(
        [
          { username: "jimmy200", password: "kjsadhfksjhdfksjdh" },
          { username: "wolfy", password: "klsndgvlserthinsk" },
          { username: "schwjar", password: "soedfsndflskdnflks" },
          { username: "jareds", password: "389475skldnl" },
          { username: "batman", password: "9830475093450935" },
          { username: "iron-man", password: "43527594046526524" },
        ].map(createUser)
      );
  
      console.log("Users seeded:", await fetchUsers());
      console.log("Products seeded:", await fetchProducts());

      const favorites = await Promise.all([
        createFavorite({ user_id: users[0].id, product_id: products[0].id }),
        createFavorite({ user_id: users[1].id, product_id: products[1].id }),
        createFavorite({ user_id: users[2].id, product_id: products[2].id }),
        createFavorite({ user_id: users[3].id, product_id: products[1].id }),
        createFavorite({ user_id: users[4].id, product_id: products[5].id }),
        createFavorite({ user_id: users[5].id, product_id: products[3].id }),
      ]);
  
      console.log(
        "Favorites for :",
        await fetchFavorites({ user_id: users[0].id })
      );

      const port = process.env.PORT || 3000;
      app.listen(port, () =>
        console.log(`Server is running on http://localhost:${port}`)
      );
    } catch (error) {
      console.error("Initialization failed:", error);
      process.exit(1);
    }
  };
  

  init();
  