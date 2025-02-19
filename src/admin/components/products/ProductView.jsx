import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import '../products/ProductView.css';
import compressor from '../../assets/compressor-img.png';
import baseurl from '../../../apiService/apiService';
 
const ProductView = () => {
  const [products, setProducts] = useState([]); // State to store fetched products
  const navigate = useNavigate();
 
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(baseurl+'/rim/getAllProducts');
        setProducts(response.data.products); // Assuming response data is an array of products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
 
    fetchProducts();
  }, []);
 
  // Navigate to product details
  const handleProductViewDetails = (product) => {
   
    navigate(`/Dashboard/products/productViewDetails/${product.product_id}`);
  };
 
  return (
    <div className="productViewContainer">
      {products.map((product) => (
        <div key={product.id} className="productViewCard">
          <img src={baseurl+`/${product.first_image}`|| compressor} alt={product.name} />
          <p>{product.name}</p>
          <div className="line"><span></span></div>
          <div className="productMrp"><h4>Rs-{product.mrp_rate}</h4></div>
          <div className="brandName"><small>{product.brand_name}</small></div>
          <div className="btnShare">
            <div>
              <button
                className="productViewCardBtn"
                onClick={() => handleProductViewDetails(product)} // Pass the product object
              >
                View Details
              </button>
            </div>
            <div className="shareIcon"><Share2 /></div>
          </div>
        </div>
      ))}
    </div>
  );
};
 
export default ProductView;
