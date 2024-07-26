import React, { useState, useEffect } from 'react';
import { Grid, Pagination, Typography, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { getAllProducts } from '../api';
import ProductCard from './productcard';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        company: '',
        rating: '',
        priceRange: [0, 1000],
        availability: '',
        sortBy: 'price',
        sortOrder: 'asc',
        page: 1,
        pageSize: 10,
    });
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        const response = await getAllProducts(filters);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    return (
        <div>
            <Typography variant="h4">All Products</Typography>
            <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                >
                    {/* Add options dynamically */}
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="electronics">Electronics</MenuItem>
                    <MenuItem value="fashion">Fashion</MenuItem>
                    {/* Add more categories as needed */}
                </Select>
            </FormControl>
            <TextField
                label="Company"
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
            />
            {/* Add other filters similarly */}
            <Grid container spacing={2}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
            <Pagination
                count={totalPages}
                page={filters.page}
                onChange={(e, value) => setFilters({ ...filters, page: value })}
            />
        </div>
    );
};

export default ProductList;