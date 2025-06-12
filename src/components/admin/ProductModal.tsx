import { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  categories: string[];
}

export function ProductModal({ product, isOpen, onClose, onSave, categories }: ProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [duration, setDuration] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategory(product.category);
      setDuration(product.duration || '');
      setIsAvailable(product.is_available);
      setImagePreview(product.image_url || null);
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setDuration('');
    setIsAvailable(true);
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (!category.trim() && !newCategory.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let imageUrl = product?.image_url || '';
      
      // If there's a new image to upload
      if (imageFile) {
        setIsUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('product_images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
        setIsUploading(false);
      }
      
      // Prepare product data
      const finalCategory = isAddingCategory && newCategory.trim() ? newCategory.trim() : category;
      
      const productData: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: finalCategory,
        duration: duration.trim() || undefined,
        is_available: isAvailable,
        image_url: imageUrl || undefined
      };
      
      // If editing existing product, include the id
      if (product?.id) {
        productData.id = product.id;
      } else {
        // For new product, add created_at
        productData.created_at = new Date().toISOString();
      }
      
      // Save to database
      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
          
        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);
          
        if (error) throw error;
      }
      
      onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-dark-surface rounded-xl w-full max-w-2xl shadow-xl h-[90vh] md:h-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-primary/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-light">
            {product ? 'Edit Product' : 'Create New Product'}
          </h3>
          <button 
            className="text-light/50 hover:text-light transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Product Image
                </label>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-dark rounded-lg overflow-hidden flex items-center justify-center border border-primary/20">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      as="label"
                      htmlFor="product-image"
                      className="cursor-pointer"
                    >
                      Select image
                    </Button>
                    <input
                      type="file"
                      id="product-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-light/50 mt-2">
                      Recommended: 800×800px JPG, PNG or GIF
                    </p>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-dark">
                      <div 
                        className="h-1 bg-primary" 
                        style={{ width: `${uploadProgress}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light/70 mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 bg-dark border rounded-lg focus:outline-none focus:border-primary ${
                    errors.name ? 'border-red-500' : 'border-primary/20'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.name}
                  </p>
                )}
              </div>
              
              {/* Product Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-light/70 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 bg-dark border rounded-lg focus:outline-none focus:border-primary ${
                    errors.description ? 'border-red-500' : 'border-primary/20'
                  }`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.description}
                  </p>
                )}
              </div>
              
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-light/70 mb-2">
                  Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-0 flex items-center h-full pl-3 text-light/70">
                    $
                  </span>
                  <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full pl-8 px-4 py-2 bg-dark border rounded-lg focus:outline-none focus:border-primary ${
                      errors.price ? 'border-red-500' : 'border-primary/20'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.price}
                  </p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                {isAddingCategory ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={`flex-1 px-4 py-2 bg-dark border rounded-lg focus:outline-none focus:border-primary ${
                        errors.category ? 'border-red-500' : 'border-primary/20'
                      }`}
                      placeholder="Enter new category"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddCategory}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingCategory(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`flex-1 px-4 py-2 bg-dark border rounded-lg focus:outline-none focus:border-primary ${
                        errors.category ? 'border-red-500' : 'border-primary/20'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingCategory(true)}
                    >
                      New
                    </Button>
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.category}
                  </p>
                )}
              </div>
              
              {/* Duration (optional) */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-light/70 mb-2">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 bg-dark border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="e.g. 60 minutes, 4 weeks"
                />
                <p className="mt-1 text-xs text-light/50">
                  Leave blank if not applicable
                </p>
              </div>
              
              {/* Product Availability */}
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded border cursor-pointer ${
                    isAvailable ? 'bg-primary border-primary' : 'border-primary/40 bg-dark'
                  }`}
                  onClick={() => setIsAvailable(!isAvailable)}
                >
                  {isAvailable && <CheckCircle2 className="w-4 h-4 text-dark" />}
                </div>
                <label className="text-light cursor-pointer" onClick={() => setIsAvailable(!isAvailable)}>
                  Product is available for purchase
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-primary/20 flex justify-end space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              product ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
