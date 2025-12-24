import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-secondary-800 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-secondary font-bold text-xl">م</span>
                            </div>
                            <span className="font-bold text-xl">ماركت باشا</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            متجرك الإلكتروني للتسوق بسهولة وراحة. نوفر لك أفضل المنتجات بأفضل الأسعار مع توصيل سريع.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-gray-400 hover:text-primary transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?featured=true" className="text-gray-400 hover:text-primary transition-colors">
                                    العروض
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-gray-400 hover:text-primary transition-colors">
                                    الدعم الفني
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                                    من نحن
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">خدمة العملاء</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/account" className="text-gray-400 hover:text-primary transition-colors">
                                    حسابي
                                </Link>
                            </li>
                            <li>
                                <Link href="/account/orders" className="text-gray-400 hover:text-primary transition-colors">
                                    تتبع الطلب
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                                    الشروط والأحكام
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                                    سياسة الخصوصية
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">تواصل معنا</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-5 h-5 text-primary" />
                                <span dir="ltr">+963 912 345 678</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-5 h-5 text-primary" />
                                <span>info@marketbasha.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>جبل باشان</span>
                            </li>
                        </ul>

                        {/* Social */}
                        <div className="flex gap-3 mt-4">
                            <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 py-4">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    © {new Date().getFullYear()} ماركت باشا. جميع الحقوق محفوظة.
                </div>
            </div>
        </footer>
    );
}
