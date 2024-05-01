"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ProductsClient } from './Product/client';
import { ProductColumn, columns } from './Product/columns';

const Products = () => {
    const [products, setProducts] = useState<ProductColumn[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/v1/products'); // Replace with your backend API endpoint
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const formattedProducts = products.map((item) => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        createdAt: format(new Date(item.createdAt), 'MMMM do, yyyy'),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <ProductsClient data={formattedProducts}  />
            </div>
        </div>
    );
};

export default Products;
