'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ShoppingCart, Search, Filter } from 'lucide-react';

export default function OnlinePharmacy() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [location, setLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const categories = ['all', 'tablets', 'capsules', 'syrup', 'injection', 'ointment'];

  useEffect(() => {
    fetchProducts();
    fetchOrderHistory();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          getAddressFromCoords(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setDeliveryAddress('Location access denied. Please enter address manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const getAddressFromCoords = async (coords) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=AIzaSyCftzu45fiNKClUtg3I0LTmn1JHLMd_5wQ`);
      const data = await response.json();
      if (data.results && data.results[0]) {
        setDeliveryAddress(data.results[0].formatted_address);
      } else {
        setDeliveryAddress(`Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setDeliveryAddress(`Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pharmacy/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const response = await fetch('/api/pharmacy/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        fetchProducts();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      const response = await fetch(`/api/pharmacy/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (response.ok) {
        fetchProducts();
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/pharmacy/products/${productId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item._id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart,
        total: getTotalCartPrice(),
        orderDate: new Date().toISOString(),
        deliveryAddress: deliveryAddress,
        location: location
      };
      
      const response = await fetch('/api/pharmacy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      setTimeout(() => {
        setIsCheckingOut(false);
        setOrderSuccess(true);
        setCart([]);
        fetchOrderHistory();
        setTimeout(() => setOrderSuccess(false), 5000);
      }, 3000);
    } catch (error) {
      console.error('Order failed:', error);
      setIsCheckingOut(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('/api/pharmacy/orders');
      const data = await response.json();
      setOrderHistory(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTotalCartItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalCartPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Online Pharmacy</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOrderHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-semibold shadow-lg transition-colors"
              >
                Order History
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold shadow-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-4xl">💊</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-emerald-500 text-white py-2 px-3 rounded-xl hover:bg-emerald-600 text-sm transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2 text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto border-2 border-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">Shopping Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-black text-2xl">&times;</button>
              </div>
              {cart.length === 0 ? (
                <p className="text-black text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-black">{item.name}</h4>
                          <p className="text-sm text-black">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-8 h-8 bg-gray-200 text-black rounded-full border-2 border-black hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-black font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-8 h-8 bg-gray-200 text-black rounded-full border-2 border-black hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-black font-semibold ml-4">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-black mb-2">Delivery Address:</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2 border-2 border-black rounded-lg text-black text-sm"
                        rows="3"
                        placeholder="Enter your delivery address"
                      />
                      <button
                        onClick={getCurrentLocation}
                        className="mt-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-300 hover:bg-blue-200"
                      >
                        📍 Use Current Location
                      </button>
                    </div>
                    <div className="flex justify-between font-semibold text-lg text-black">
                      <span>Total: ₹{getTotalCartPrice()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-green-600 text-black py-3 rounded-xl hover:bg-green-700 border-2 border-black font-semibold mb-2"
                  >
                    {isCheckingOut ? 'Processing...' : 'Buy Now'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Order Success Modal */}
        {orderSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl p-8 text-center border-2 border-black shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-black mb-4">Successfully Purchased!</h2>
              <div className="bg-white rounded-lg p-4 border-2 border-black mb-4">
                <p className="text-black font-semibold text-lg mb-2">✅ Order Confirmed</p>
                <p className="text-black mb-2">Your medicines are being prepared</p>
                <div className="flex items-center justify-center gap-2 text-black font-bold">
                  <span className="text-2xl">🚚</span>
                  <span>Guaranteed Delivery in 60 Minutes!</span>
                </div>
              </div>
              <p className="text-black text-sm">Thank you for choosing our pharmacy</p>
            </div>
          </div>
        )}

        {/* Order History Modal */}
        {showOrderHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">Order History</h2>
                <button onClick={() => setShowOrderHistory(false)} className="text-black text-2xl">&times;</button>
              </div>
              {orderHistory.length === 0 ? (
                <p className="text-black text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order, index) => (
                    <div key={index} className="border-2 border-black rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-black">Order #{index + 1}</span>
                        <span className="text-black">₹{order.total}</span>
                      </div>
                      <p className="text-sm text-black mb-2">{new Date(order.orderDate).toLocaleDateString()}</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-sm text-black">
                            {item.name} x{item.quantity} - ₹{item.price * item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {(showAddModal || editingProduct) && (
          <ProductModal
            product={editingProduct}
            onSave={editingProduct ? handleEditProduct : handleAddProduct}
            onClose={() => {
              setShowAddModal(false);
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'tablets',
    image: product?.image || '',
    stock: product?.stock || ''
  });
  const [imagePreview, setImagePreview] = useState(product?.image || '');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({...formData, image: base64String});
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 w-full max-w-md border-2 border-green-200 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-black">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border-2 border-black rounded-xl text-black"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border-2 border-black rounded-xl h-20 text-black"
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full p-3 border-2 border-black rounded-xl text-black"
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full p-3 border-2 border-black rounded-xl text-black"
          >
            <option value="tablets">Tablets</option>
            <option value="capsules">Capsules</option>
            <option value="syrup">Syrup</option>
            <option value="injection">Injection</option>
            <option value="ointment">Ointment</option>
          </select>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-3 border-2 border-black rounded-xl bg-white text-black"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
              </div>
            )}
          </div>
          <input
            type="number"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            className="w-full p-3 border-2 border-black rounded-xl text-black"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-black py-2 rounded-xl hover:bg-green-700 font-semibold border-2 border-black"
            >
              {product ? 'Update' : 'Add'} Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-xl hover:bg-gray-500 border-2 border-black"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}