import { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle,
  Phone,
  Mail,
  User,
  X,
  AlertCircle,
  Tag
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
  getMarketplaceItems,
  createMarketplaceItem,
  updateMarketplaceItem,
  updateMarketplaceStatus,
  deleteMarketplaceItem
} from '../services/marketplaceService';
import { useAuth } from '../../../context/AuthContext';

const CATEGORIES = [
  'All',
  'Books & Notes',
  'Engineering Equipment',
  'Bicycles & Transport',
  'Electronics',
  'Hostel Essentials',
  'Stationery',
  'Other'
];

const CONDITIONS = ['Like New', 'Good', 'Fair', 'Refurbished'];

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('Available');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Contact Seller Modal State
  const [contactSellerItem, setContactSellerItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    productName: '',
    category: 'Books & Notes',
    price: '',
    conditionType: 'Good',
    description: '',
    contactPhone: user?.phone || ''
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMarketplaceItems({
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        search: search || undefined,
        page,
        limit: 9
      });
      setItems(res.data || []);
      setPagination(res.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load marketplace listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      productName: '',
      category: 'Books & Notes',
      price: '',
      conditionType: 'Good',
      description: '',
      contactPhone: user?.phone || ''
    });
    setSelectedImage(null);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      productName: item.product_name,
      category: item.category,
      price: item.price,
      conditionType: item.condition_type || 'Good',
      description: item.description,
      contactPhone: item.contact_phone || ''
    });
    setSelectedImage(null);
    setModalError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.category || !form.price || !form.description) {
      setModalError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('productName', form.productName);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('conditionType', form.conditionType);
    formData.append('description', form.description);
    if (form.contactPhone) formData.append('contactPhone', form.contactPhone);
    if (selectedImage) formData.append('image', selectedImage);

    setModalLoading(true);
    setModalError('');
    try {
      if (editingItem) {
        await updateMarketplaceItem(editingItem.product_id, formData);
      } else {
        await createMarketplaceItem(formData);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Error saving listing.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleSold = async (item) => {
    const newStatus = item.status === 'Available' ? 'Sold' : 'Available';
    try {
      await updateMarketplaceStatus(item.product_id, newStatus);
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await deleteMarketplaceItem(productId);
      fetchItems();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete listing.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Campus Marketplace</h1>
            <p className="text-xs text-gray-400 mt-1">
              Peer-to-peer student exchange for textbooks, drafting equipment, electronics, and bicycles.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Listing</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-carbon-black-400 border border-gray-800 p-3 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <Filter size={14} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-carbon-black text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-carbon-black-100 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="bg-transparent text-gray-200 outline-none cursor-pointer"
              >
                <option value="Available" className="bg-carbon-black text-white">Available Only</option>
                <option value="Sold" className="bg-carbon-black text-white">Sold Items</option>
                <option value="All" className="bg-carbon-black text-white">All Listings</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-xs relative">
            <input
              type="text"
              placeholder="Search products, textbooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-carbon-black-100 border border-gray-700 text-gray-200 text-xs px-3 py-2 pl-8 rounded-xl outline-none focus:border-yellow-400 transition"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          </form>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading marketplace items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl p-12 text-center">
            <Store size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No marketplace listings found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              There are no listings matching your current category or keyword criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isOwner = user?.user_id === item.seller_id || user?.role === 'Admin';
              const isSold = item.status === 'Sold';

              return (
                <div
                  key={item.product_id}
                  className="bg-carbon-black-400 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-700 transition"
                >
                  {item.image_url && (
                    <div className="h-44 w-full overflow-hidden bg-gray-900 border-b border-gray-800">
                      <img
                        src={item.image_url.startsWith('http') ? item.image_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${item.image_url}`}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
                            {item.condition_type}
                          </span>
                          {isSold && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950/40 text-red-400 border border-red-800">
                              Sold
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{item.product_name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3 mt-2">{item.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-gray-500">Asking Price</span>
                        <p className="text-xl font-bold text-yellow-300">₹{Number(item.price).toFixed(2)}</p>
                      </div>

                      <div className="text-right text-[11px] text-gray-400">
                        <div className="flex items-center gap-1 justify-end">
                          <User size={12} className="text-gray-500" />
                          <span>{item.seller_name}</span>
                        </div>
                        <span className="text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="bg-carbon-black-100 px-5 py-3 border-t border-gray-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <>
                          <button
                            onClick={() => handleToggleSold(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                              isSold
                                ? 'bg-yellow-300 text-black'
                                : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                            }`}
                          >
                            <CheckCircle size={13} />
                            <span>{isSold ? 'Relist Item' : 'Mark Sold'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
                            title="Edit Listing"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(item.product_id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setContactSellerItem(item)}
                          disabled={isSold}
                          className="px-3.5 py-1.5 rounded-lg bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                        >
                          <Phone size={13} />
                          <span>Contact Seller</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setContactSellerItem(item)}
                      className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-carbon-black-400 border border-gray-800 text-xs text-gray-300 rounded-lg hover:border-gray-700 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 bg-carbon-black-400 border border-gray-800 text-xs text-gray-300 rounded-lg hover:border-gray-700 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Contact Seller Modal */}
        {contactSellerItem && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-300/10 text-yellow-300 border border-yellow-300/20">
                    {contactSellerItem.category}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">{contactSellerItem.product_name}</h2>
                  <p className="text-lg font-bold text-yellow-300 mt-1">₹{Number(contactSellerItem.price).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setContactSellerItem(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {contactSellerItem.image_url && (
                <div className="h-44 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img
                    src={contactSellerItem.image_url.startsWith('http') ? contactSellerItem.image_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${contactSellerItem.image_url}`}
                    alt={contactSellerItem.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="bg-carbon-black-100 p-3.5 rounded-xl border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={14} className="text-yellow-300 flex-shrink-0" />
                  <span>Seller: <strong className="text-white">{contactSellerItem.seller_name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${contactSellerItem.seller_email}`} className="text-yellow-300 hover:underline">
                    {contactSellerItem.seller_email}
                  </a>
                </div>
                {contactSellerItem.contact_phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <a href={`tel:${contactSellerItem.contact_phone}`} className="text-yellow-300 hover:underline">
                      {contactSellerItem.contact_phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Tag size={14} className="text-gray-500 flex-shrink-0" />
                  <span>Condition: {contactSellerItem.condition_type}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Item Notes</h4>
                <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{contactSellerItem.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                {contactSellerItem.contact_phone && (
                  <a
                    href={`tel:${contactSellerItem.contact_phone}`}
                    className="px-4 py-2 bg-yellow-300 text-black font-semibold rounded-xl text-xs hover:bg-yellow-400 transition"
                  >
                    Call Seller
                  </a>
                )}
                <button
                  onClick={() => setContactSellerItem(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-carbon-black-400 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h2 className="text-base font-bold text-white">
                  {editingItem ? 'Edit Listing' : 'Post Marketplace Item'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="mt-3 p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3 mt-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering Mechanics (Timoshenko & Young) - 5th Edition"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Condition *</label>
                    <select
                      value={form.conditionType}
                      onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    >
                      {CONDITIONS.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Price (₹ INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 450.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91..."
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Specify condition details, edition, included accessories, or pickup location..."
                    className="w-full bg-carbon-black-100 border border-gray-700 text-white rounded-xl p-2.5 outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1">Product Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setSelectedImage(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
                  />
                  {selectedImage && (
                    <span className="text-[11px] text-yellow-300 mt-1 block">Selected: {selectedImage.name}</span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Post Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
