'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "الصورة" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار صورة');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'offers');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setPreview(data.url);
                onChange(data.url);
            } else {
                alert('فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange(null);
    };

    return (
        <div>
            <label className="block text-sm font-bold text-secondary-800 mb-2">
                {label}
            </label>

            {preview ? (
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            {uploading ? (
                                <>
                                    <div className="spinner mb-2"></div>
                                    <p>جاري الرفع...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 mb-2" />
                                    <p className="font-semibold">اضغط لرفع صورة</p>
                                    <p className="text-sm mt-1">PNG, JPG, GIF (حجم أقصى 5MB)</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>
            )}
        </div>
    );
}
