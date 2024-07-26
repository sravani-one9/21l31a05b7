const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCT_CACHE_TTL = 60 * 60; // Cache product data for 1 hour
const productCache = new NodeCache({ stdTTL: PRODUCT_CACHE_TTL });

const CLIENT_ID = '77359293-1d55-402d-a971-2ca071fb0320';
const CLIENT_SECRET = 'UnrNbOYiLrkKwTVg';

// Define the base URL for the test E-Commerce server
const CATEGORY_API_URL = 'http://20.244.56.144/test/companies';
const ECOMMERCE_COMPANIES = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];

// Middleware to validate query parameters for pagination
app.use((req, res, next) => {
  const { n, page } = req.query;
  if (n && isNaN(n)) {
    return res.status(400).send({ error: 'Query parameter n must be a number' });
  }
  if (page && isNaN(page)) {
    return res.status(400).send({ error: 'Query parameter page must be a number' });
  }
  next();
});

// Function to fetch products from the test E-Commerce APIs
const fetchProducts = async (category, minPrice, maxPrice, top) => {
  let allProducts = [];
  for (let company of ECOMMERCE_COMPANIES) {
    const response = await axios.get(`${CATEGORY_API_URL}/${company}/categories/${category}/products`, {
      params: {
        top,
        minPrice,
        maxPrice
      },
      headers: {
        'Client-ID': CLIENT_ID,
        'Client-Secret': CLIENT_SECRET
      }
    });
    allProducts = allProducts.concat(response.data);
  }
  return allProducts.map(product => ({
    ...product,
    uniqueId: uuidv4() // Generate a unique ID for each product
  }));
};

// GET /categories/:categoryname/products endpoint
app.get('/categories/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  const { n = 10, page = 1, sort, order = 'asc', minPrice = 0, maxPrice = Infinity } = req.query;

  try {
    // Key to cache products based on category, price range, and sorting parameters
    const cacheKey = `${categoryname}_${minPrice}_${maxPrice}_${sort}_${order}_${n}_${page}`;
    let products = productCache.get(cacheKey);

    if (!products) {
      products = await fetchProducts(categoryname, minPrice, maxPrice, n);
      productCache.set(cacheKey, products);
    }

    // Sorting
    if (sort) {
      products = products.sort((a, b) => {
        if (order === 'asc') {
          return a[sort] - b[sort];
        } else {
          return b[sort] - a[sort];
        }
      });
    }

    // Pagination
    const startIndex = (page - 1) * n;
    const endIndex = startIndex + parseInt(n);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json(paginatedProducts);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching products' });
  }
});

// GET /categories/:categoryname/products/:productid endpoint
app.get('/categories/:categoryname/products/:productid', async (req, res) => {
  const { categoryname, productid } = req.params;

  try {
    let products = productCache.get(`${categoryname}_${0}_${Infinity}`);

    if (!products) {
      products = await fetchProducts(categoryname, 0, Infinity, 10);
      productCache.set(`${categoryname}_${0}_${Infinity}`, products);
    }

    const product = products.find(p => p.uniqueId === productid);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Error fetching product details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
