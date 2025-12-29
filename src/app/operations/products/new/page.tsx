'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Upload, X, AlertCircle, Image as ImageIcon, Star } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface ServiceArea {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        categoryId: '',
        stock: 0,
        unit: 'كيلو',
        lowStockThreshold: 10,
        isActive: true,
        isFeatured: false,
        trackStock: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, areasRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/service-areas?active=true')
                ]);

                if (catRes.ok) {
                    const data = await catRes.json();
                    setCategories(data.categories);
                }
                if (areasRes.ok) {
                    const data = await areasRes.json();
                    setServiceAreas(data.areas || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            const uploadedUrls: string[] = [];

            for (const file of Array.from(files)) {
                // Create FormData for upload
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    uploadedUrls.push(data.url);
                } else {
                    // If upload API doesn't exist, use base64 as fallback
                    const reader = new FileReader();
                    const url = await new Promise<string>((resolve) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                    uploadedUrls.push(url);
                }
            }

            setImages(prev => [...prev, ...uploadedUrls]);
        } catch (error) {
            console.error('Error uploading images:', error);
            setError('حدث خطأ في رفع الصور');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(prev => prev - 1);
        }
    };

    const setAsMain = (index: number) => {
        setMainImageIndex(index);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const mainImage = images[mainImageIndex] || null;
            const additionalImages = images.filter((_, i) => i !== mainImageIndex);

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    image: mainImage,
                    images: additionalImages,
                    serviceAreaIds: selectedAreaIds,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/operations/products');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/operations/products" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-secondary-800">إضافة منتج جديد</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* صور المنتج */}
                <div className="card p-4 md:p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">صور المنتج</h3>

                    <div className="space-y-4">
                        {/* عرض الصور */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImageIndex === index
                                            ? 'border-primary ring-2 ring-primary/30'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`صورة ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Badge للصورة الرئيسية */}
                                        {mainImageIndex === index && (
                                            <div className="absolute top-2 right-2 bg-primary text-secondary px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                رئيسية
                                            </div>
                                        )}

                                        {/* أزرار التحكم */}
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between">
                                            {mainImageIndex !== index && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAsMain(index)}
                                                    className="text-white text-xs hover:text-primary transition-colors"
                                                >
                                                    تعيين رئيسية
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="text-red-400 hover:text-red-300 mr-auto"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* زر رفع الصور */}
                        <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 md:p-8 cursor-pointer transition-colors ${uploading ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span className="text-gray-600">جاري الرفع...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-700 font-medium">اضغط لرفع الصور</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, WEBP (حتى 5 ميجا)</p>
                                    </div>
                                </>
                            )}
                        </label>

                        {images.length > 0 && (
                            <p className="text-sm text-gray-500 text-center">
                                💡 اضغط على "تعيين رئيسية" لاختيار الصورة التي ستظهر كبانر للمنتج
                            </p>
                        )}
                    </div>
                </div>

                {/* معلومات المنتج */}
                <div className="card p-4 md:p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">معلومات المنتج الأساسية</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input min-h-24"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المتجر *</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="">اختر المتجر</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">وحدة القياس</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="input"
                            >
                                <option value="كيلو">كيلو</option>
                                <option value="قطعة">قطعة</option>
                                <option value="لتر">لتر</option>
                                <option value="عبوة">عبوة</option>
                                <option value="ربطة">ربطة</option>
                            </select>
                        </div>

                        {/* مناطق التخديم */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">مناطق التخديم *</label>
                            <p className="text-xs text-gray-500 mb-2">اختر المناطق التي يتوفر فيها هذا المنتج</p>
                            <div className="flex flex-wrap gap-2">
                                {serviceAreas.map((area) => (
                                    <label
                                        key={area.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedAreaIds.includes(area.id)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAreaIds.includes(area.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAreaIds([...selectedAreaIds, area.id]);
                                                } else {
                                                    setSelectedAreaIds(selectedAreaIds.filter(id => id !== area.id));
                                                }
                                            }}
                                            className="sr-only"
                                        />
                                        <span className="text-sm">{area.name}</span>
                                    </label>
                                ))}
                            </div>
                            {serviceAreas.length === 0 && (
                                <p className="text-sm text-yellow-600 mt-2">⚠️ لا توجد مناطق تخديم. يرجى إضافة مناطق أولاً.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* التسعير */}
                <div className="card p-4 md:p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">التسعير والمخزون</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ل.س) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السعر قبل الخصم</label>
                            <input
                                type="number"
                                value={formData.compareAtPrice}
                                onChange={(e) => setFormData({ ...formData, compareAtPrice: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">حد التحذير</label>
                            <input
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* الخيارات */}
                <div className="card p-4 md:p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">الخيارات</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <div>
                                <span className="block font-medium text-gray-700">منتج نشط</span>
                                <span className="block text-xs text-gray-500">ظاهر للعملاء</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <div>
                                <span className="block font-medium text-gray-700">منتج مميز</span>
                                <span className="block text-xs text-gray-500">يظهر في الرئيسية</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.trackStock}
                                onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <div>
                                <span className="block font-medium text-gray-700">تتبع المخزون</span>
                                <span className="block text-xs text-gray-500">إدارة الكميات</span>
                            </div>
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full sm:w-auto"
                    >
                        {loading ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ المنتج</>}
                    </button>
                    <Link href="/operations/products" className="btn btn-outline w-full sm:w-auto text-center">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
