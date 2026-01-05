'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, Search, ChevronDown } from 'lucide-react';

interface MultiSelectItem {
    id: string;
    name: string;
}

interface MultiSelectProps {
    items: MultiSelectItem[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
    placeholder?: string;
    emptyMessage?: string;
}

export default function MultiSelect({
    items,
    selected,
    onChange,
    label,
    placeholder = "بحث...",
    emptyMessage = "لا يوجد عناصر"
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleItem = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(sid => sid !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const removeItem = (id: string) => {
        onChange(selected.filter(sid => sid !== id));
    };

    const selectedItems = items.filter(item => selected.includes(item.id));

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-bold text-secondary-800 mb-2">
                {label}
            </label>

            {/* Selected Items as Chips */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedItems.map(item => (
                        <div
                            key={item.id}
                            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-secondary-900 px-3 py-1.5 rounded-xl text-sm font-medium"
                        >
                            <span>{item.name}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-right hover:border-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all flex items-center justify-between"
            >
                <span className="text-gray-500">
                    {selected.length > 0 ? `${selected.length} محدد` : 'اختر عناصر'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={placeholder}
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => {
                                const isSelected = selected.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className={`w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <span className={`${isSelected ? 'font-semibold text-secondary-900' : 'text-gray-700'}`}>
                                            {item.name}
                                        </span>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-secondary-900" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Helper Text */}
            {selectedItems.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                    💡 ترك الحقل فارغاً يعني أن العرض سيطبق على كل المنتجات
                </p>
            )}
        </div>
    );
}
