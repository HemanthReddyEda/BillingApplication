import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/api.js';
import './product.css';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

function ProductList({ role, onAddToCart = null }) {
  const [state, setState] = useState({
    products: [],
    newProducts: [{ id: '', name: '', description: '', price: '', image: '' }],
    editProduct: null,
    loading: false,
    errorMessage: '',
    searchTerm: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setState(prevState => ({ ...prevState, loading: true }));
      try {
        const response = await getProducts();
        setState(prevState => ({ ...prevState, products: response.data }));
      } catch (error) {
        setError('Error fetching products. Please try again.');
      } finally {
        setState(prevState => ({ ...prevState, loading: false }));
      }
    };
    fetchProducts();
  }, []);

  const setError = (message) => {
    setState(prevState => ({ ...prevState, errorMessage: message }));
    toast.error(message);
  };

  const handleAddProduct = async () => {
    const { newProducts } = state;
    const invalidProduct = newProducts.find(product => 
      !product.id || !product.name || !product.price || parseFloat(product.price) <= 0
    );

    if (invalidProduct) {
      return setError('Each product must have a valid ID, Name, and positive Price.');
    }

    setState(prevState => ({ ...prevState, loading: true }));
    try {
      const responses = await Promise.all(newProducts.map(product => addProduct(product)));
      setState(prevState => ({
        ...prevState,
        products: [...prevState.products, ...responses.map(res => res.data)],
        newProducts: [{ id: '', name: '', description: '', price: '', image: '' }]
      }));
      toast.success('Products added successfully.');
    } catch (error) {
      setError('Failed to add products. Please try again.');
    } finally {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  };

  const addNewProductField = () => {
    setState(prevState => ({
      ...prevState,
      newProducts: [...prevState.newProducts, { id: '', name: '', description: '', price: '', image: '' }]
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = state.newProducts.map((product, idx) =>
      idx === index ? { ...product, [field]: value } : product
    );
    setState(prevState => ({ ...prevState, newProducts: updatedProducts }));
  };

  const removeProductField = (index) => {
    const updatedProducts = state.newProducts.filter((_, idx) => idx !== index);
    setState(prevState => ({ ...prevState, newProducts: updatedProducts }));
  };

  const handleDeleteProduct = async (productId) => {
    setState(prevState => ({ ...prevState, loading: true }));
    try {
      await deleteProduct(productId);
      setState(prevState => ({
        ...prevState,
        products: prevState.products.filter(p => p.id !== productId)
      }));
      toast.success('Product deleted successfully.');
    } catch (error) {
      setError('Failed to delete product. Please try again.');
    } finally {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  };

  const handleUpdateProduct = async () => {
    const { editProduct } = state;
    if (!editProduct || parseFloat(editProduct.price) <= 0) {
      return setError('Price must be a positive number.');
    }

    setState(prevState => ({ ...prevState, loading: true }));
    try {
      const response = await updateProduct(editProduct.id, editProduct);
      setState(prevState => ({
        ...prevState,
        products: prevState.products.map(p => (p.id === editProduct.id ? response.data : p)),
        editProduct: null
      }));
      toast.success('Product updated successfully.');
    } catch (error) {
      setError('Failed to update product. Please try again.');
    } finally {
      setState(prevState => ({ ...prevState, loading: false }));
    }
  };

  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  return (
    <div className="product-list-container">
      <ToastContainer />
      <h2 className="title">Product List</h2>
      {state.loading && <Spinner animation="border" />}
      {state.errorMessage && <p className="error-message">{state.errorMessage}</p>}

      <input
        type="text"
        placeholder="Search by name..."
        value={state.searchTerm}
        onChange={(e) => setState(prevState => ({ ...prevState, searchTerm: e.target.value }))}
        className="search-bar"
      />

      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p>No products available.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">Price: ₹{product.price}</p>
              <p className="product-id">Product ID: {product.id}</p>

              {role === 'customer' && onAddToCart && (
                <button className="add-to-cart-btn" onClick={() => onAddToCart(product)} disabled={state.loading}>
                  Add to Cart
                </button>
              )}
              {role === 'admin' && (
                <div className="admin-buttons">
                  <button className="edit-btn" onClick={() => setState(prevState => ({ ...prevState, editProduct: product }))} disabled={state.loading}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)} disabled={state.loading}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {role === 'admin' && (
        <div className="add-product-section">
          <h3>Add New Products</h3>
          {state.newProducts.map((product, index) => (
            <div key={index} className="product-form">
              <input
                placeholder="Product ID"
                value={product.id}
                onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                className="form-input"
              />
              <input
                placeholder="Name"
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                className="form-input"
              />
              <input
                placeholder="Description"
                value={product.description}
                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                className="form-input"
              />
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                className="form-input"
              />
              <input
                placeholder="Image URL"
                value={product.image}
                onChange={(e) => handleProductChange(index, 'image', e.target.value)}
                className="form-input"
              />
              <button className="remove-product-btn" onClick={() => removeProductField(index)}>
                Remove
              </button>
            </div>
          ))}
          <button className="add-another-btn" onClick={addNewProductField}>
            Add Another Product
          </button>
          <button className="add-products-btn" onClick={handleAddProduct}>
            Add Products
          </button>
        </div>
      )}

      {state.editProduct && (
        <div className="edit-product-section">
          <h3>Edit Product</h3>
          <input
            placeholder="Name"
            value={state.editProduct.name}
            onChange={(e) => setState(prevState => ({ ...prevState, editProduct: { ...prevState.editProduct, name: e.target.value } }))}
            className="form-input"
          />
          <input
            placeholder="Description"
            value={state.editProduct.description}
            onChange={(e) => setState(prevState => ({ ...prevState, editProduct: { ...prevState.editProduct, description: e.target.value } }))}
            className="form-input"
          />
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            value={state.editProduct.price}
            onChange={(e) => setState(prevState => ({ ...prevState, editProduct: { ...prevState.editProduct, price: e.target.value } }))}
            className="form-input"
          />
          <button className="update-product-btn" onClick={handleUpdateProduct}>
            Update Product
          </button>
          <button className="cancel-edit-btn" onClick={() => setState(prevState => ({ ...prevState, editProduct: null }))}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

ProductList.propTypes = {
  role: PropTypes.string.isRequired,
  onAddToCart: PropTypes.func
};

export default ProductList;
