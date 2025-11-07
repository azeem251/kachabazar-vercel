import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts } from '../../ReduxSlices/productSlice';
import { MdPunchClock } from 'react-icons/md';
import { FaHome } from 'react-icons/fa';
import CategorySwiper from '../../components/CategorySwiper/CategorySwiper';
// 🖼️ You can use your own placeholder
import { BACKEND_URL } from '../../utils/api';
import KachaBazar from "../../components/kachaBazar/KachaBazar"
import TesteCom from '../../components/TesteCom/TesteCom';
const CategoryProduct = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.list);

  const queryParams = new URLSearchParams(location.search);
  const categorySlug = queryParams.get('category');
  const subcategorySlug = queryParams.get('subcategory');
  const readableCategory = categorySlug?.replace(/-/g, ' ');
  const readableSubcategory = subcategorySlug?.replace(/-/g, ' ');
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  // 🔍 Search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

 

  // 🔍 Search and Filter Logic

  useEffect(() => {
    const fetchProducts = async () => {
      if (!readableCategory) return;

      try {
        const url = new URL(`${BACKEND_URL}/api/products`);
      
        url.searchParams.append("category", readableCategory);
        if (readableSubcategory) {
          url.searchParams.append("subcategory", readableSubcategory);
        }

        const res = await axios.get(url.toString());
       
        dispatch(setProducts(res.data));
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };
    fetchProducts();
  }, [readableCategory, readableSubcategory, dispatch]);


  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMin = minPrice ? product.price >= parseFloat(minPrice) : true;
    const matchesMax = maxPrice ? product.price <= parseFloat(maxPrice) : true;
    return matchesSearch && matchesMin && matchesMax;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setLoadingMore(false);
    }, 1000);
  };

  return (

    <>
      <TesteCom />
      <CategorySwiper />
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className='text-sm text-gray-600 mb-3 flex flex-wrap items-center gap-2'>
          <Link to="/" className="text-black font-medium hover:text-emerald-600 flex items-center gap-1">
            <FaHome size={14} /> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-slate-900 font-medium capitalize">
            {readableSubcategory || readableCategory}
          </span>
        </div>

        {/* 🔍 Search & Filter */}
        <h5 className='my-3'>Search Products By: Name , Price</h5>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search product by name"
            className="border px-3 py-2 rounded shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min Price"
            className="border px-3 py-2 rounded shadow-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="border px-3 py-2 rounded shadow-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Product Grid or No Product Found */}
        {visibleProducts.length > 0 ? (
          <>
            <div className="grid mt-3 mb-3 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {visibleProducts.map((product) => (
                <div key={product._id} className='group box-border overflow-hidden flex rounded-md shadow-sm p-0 flex-col items-center bg-white relative'>
                  <div className='absolute top-2 left-2  bg-gray-100 text-green-500 rounded-full text-xs px-2 py-0 font-medium'>
                    Stock: <span className='text-orange-700 pl-1 font-bold'>{product.stock}</span>
                  </div>
                  <Link to={`/product/${product.name.replace(/\s+/g, "-")}/${product._id}`}>
                    <div className='relative flex justify-center cursor-pointer pt-2 w-full h-44'>
                      <div className='relative w-full h-full overflow-hidden'>
                        <img
                          alt={product.name}
                          loading='lazy'
                          src={product.image}
                          className='object-contain transition duration-200 ease-in-out transform group-hover:scale-110 w-full h-full p-2'
                        />
                      </div>
                    </div>
                  </Link>
                  <div className='w-full px-3 lg:px-4 pb-4 overflow-hidden'>
                    <div className='relative mb-1'>
                      <h6 className='truncate mb-0 block text-sm font-medium text-gray-600'>
                        <span className='line-clamp-2 prdoctu_name'>{product.name}</span>
                      </h6>
                    </div>
                    <div className='flex justify-between items-center text-heading text-sm sm:text-base lg:text-xl'>
                      <div className='font-serif product-price font-bold'>
                        <span className='inline-block text-lg font-semibold text-gray-800'>₹{product.price}</span>
                      </div>
                      <button
                        aria-label='cart'
                        className='h-9 w-9 flex items-center justify-center border border-gray-200 rounded text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all'>
                        <MdPunchClock size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className='mt-6 flex justify-center'>
                <button
                  onClick={handleLoadMore}
                  className='px-5 py-2 bg-emerald-600 my-4 text-white rounded hover:bg-emerald-700 transition-all'
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Show More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='flex justify-center items-center h-80'>
            <div className='text-center'>
              <img
                src='https://cdn-icons-png.flaticon.com/512/6134/6134065.png'
                alt='No Products Found'
                className='w-32 mx-auto mb-3'
              />
              <p className='text-gray-500 font-medium'>No products found.</p>
            </div>
          </div>
        )}
      </div>
      <KachaBazar />
    </>
  );
};

export default CategoryProduct;
