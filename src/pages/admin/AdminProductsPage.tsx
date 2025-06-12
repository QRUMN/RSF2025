import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Filter,
  ArrowUpDown,
  Tag,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductModal } from '../../components/admin/ProductModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  duration?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [sortBy, sortDirection, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*');

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query
        .order(sortBy, { ascending: sortDirection === 'asc' });

      if (error) throw error;

      setProducts(data || []);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set((data || []).map(product => product.category)));
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsModalOpen(false);
    
    // Wait briefly to allow modal to close for better UX
    setTimeout(() => {
      fetchProducts();
    }, 300);
  };

  const toggleSort = (column: 'name' | 'price' | 'created_at') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-light flex items-center">
          <ShoppingBag className="mr-2" /> Products & Programs
        </h1>
        
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateProduct}
        >
          Create Product
        </Button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light/50" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full bg-dark-surface border border-primary/20 rounded-lg text-light focus:outline-none focus:border-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light/50" />
            <select
              className="pl-10 pr-4 py-2 w-full bg-dark-surface border border-primary/20 rounded-lg text-light focus:outline-none focus:border-primary appearance-none"
              value={categoryFilter || ''}
              onChange={e => setCategoryFilter(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter(null);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-dark-surface rounded-xl p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-light mb-2">No Products Found</h2>
          <p className="text-light/70 mb-6">
            {searchTerm || categoryFilter
              ? 'Try adjusting your search or filter'
              : 'Create your first product to get started'}
          </p>
          
          {(!searchTerm && !categoryFilter) && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleCreateProduct}
            >
              Create First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-dark-surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-surface border-b border-primary/20">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-light/70">Image</th>
                  <th 
                    className="p-4 text-left text-sm font-medium text-light/70 cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === 'name' && (
                        <ArrowUpDown className={`w-4 h-4 ml-1 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-light/70">Category</th>
                  <th 
                    className="p-4 text-left text-sm font-medium text-light/70 cursor-pointer"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {sortBy === 'price' && (
                        <ArrowUpDown className={`w-4 h-4 ml-1 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-light/70">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-light/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-primary/10">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-dark rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-primary/40" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-light">{product.name}</div>
                      <div className="text-xs text-light/50 mt-1 flex items-center">
                        {product.duration ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" /> {product.duration}
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 mr-1" /> {product.description.substring(0, 30)}...
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        <Tag className="w-3 h-3 mr-1" /> {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-light">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span 
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.is_available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.is_available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit className="w-4 h-4" />}
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        
                        {confirmDeleteId === product.id ? (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              leftIcon={deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteLoading}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<X className="w-4 h-4" />}
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={deleteLoading}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
