import { type SharedData, PageProps } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: number;
  name: string;
  price: number;
  network: string;
  expiry: string;
  product_type: 'customer_products' | 'agent_product';
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: string;
  beneficiary_number: string;
  product: {
    name: string;
    price: number;
    network: string;
    expiry: string;
  };
}

interface WelcomeProps extends PageProps {
  cartCount?: number;
  cartItems?: CartItem[];
  products?: Product[];
}

export default function Welcome() {
    const { auth, cartCount = 0, cartItems = [], products = [] } = usePage<WelcomeProps>().props;
    const [scrolled, setScrolled] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    
    // Place Order states
    const [selectedNetwork, setSelectedNetwork] = useState('MTN');
    const [orderType, setOrderType] = useState<'excel' | 'bulk' | 'single'>('single');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bundleSize, setBundleSize] = useState('');
    const [bulkNumbers, setBulkNumbers] = useState('');
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [availableSizes, setAvailableSizes] = useState<Array<{value: string, label: string, price: number}>>([]);
    const [loadingSizes, setLoadingSizes] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const networks = [
        { id: 'MTN', name: 'MTN', icon: '/mtnlogo.jpeg', color: 'bg-yellow-500' },
        { id: 'TELECEL', name: 'Telecel', icon: '/telecellogo.png', color: 'bg-red-500' },
        { id: 'ISHARE', name: 'Ishare', icon: '/atlogo.png', color: 'bg-blue-500' },
        { id: 'BIGTIME', name: 'Bigtime', icon: '/atlogo.png', color: 'bg-purple-500' }
    ];

    const getNetworkButtonColors = (networkId: string) => {
        switch (networkId) {
            case 'MTN': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'TELECEL': return 'bg-red-500 hover:bg-red-600';
            case 'ISHARE': return 'bg-blue-500 hover:bg-blue-600';
            case 'BIGTIME': return 'bg-purple-500 hover:bg-purple-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const fetchBundleSizes = async (network: string) => {
        setLoadingSizes(true);
        try {
            const response = await fetch(`/api/bundle-sizes?network=${network}`);
            const data = await response.json();
            if (data.success) {
                setAvailableSizes(data.sizes);
            } else {
                setAvailableSizes([]);
            }
        } catch (error) {
            console.error('Error fetching bundle sizes:', error);
            setAvailableSizes([]);
        } finally {
            setLoadingSizes(false);
        }
    };

    const handleNetworkChange = (networkId: string) => {
        setSelectedNetwork(networkId);
        setBundleSize('');
        fetchBundleSizes(networkId);
    };

    const handleProcessExcel = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        
        if (!excelFile) return;
        
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('network', selectedNetwork);
        
        try {
            const response = await fetch('/process-excel-to-cart', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });
            
            const data = await response.json();
            if (data.success) {
                setExcelFile(null);
                router.reload();
            } else {
                alert(data.message || 'Failed to process Excel file');
            }
        } catch (error) {
            alert('Error processing Excel file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProcessBulk = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        
        if (!bulkNumbers.trim()) return;
        
        setIsProcessing(true);
        try {
            const response = await fetch('/process-bulk-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    numbers: bulkNumbers,
                    network: selectedNetwork
                }),
            });
            
            const data = await response.json();
            if (data.success) {
                setBulkNumbers('');
                router.reload();
            } else {
                alert(data.message || 'Failed to process bulk numbers');
            }
        } catch (error) {
            alert('Error processing bulk numbers');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddSingle = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        
        if (!phoneNumber || !bundleSize) return;
        
        const existingCartItem = cartItems.find(item => item.beneficiary_number === phoneNumber);
        
        if (existingCartItem) {
            alert('This phone number is already in your cart');
            return;
        }
        
        router.post(route('add.to.cart'), {
            network: selectedNetwork,
            quantity: bundleSize,
            beneficiary_number: phoneNumber,
        }, {
            onSuccess: () => {
                setPhoneNumber('');
                setBundleSize('');
            },
            onError: (errors) => {
                console.error('Error adding to cart:', errors);
            }
        });
    };

    const handleRemoveFromCart = (cartId: number) => {
        router.delete(route('remove.from.cart', cartId));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || 
                file.type === 'application/csv' ||
                file.name.endsWith('.csv')) {
                setExcelFile(file);
            } else {
                alert('Please select a valid CSV file (.csv)');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            if (file.type === 'text/csv' || 
                file.type === 'application/csv' ||
                file.name.endsWith('.csv')) {
                setExcelFile(file);
            } else {
                alert('Please select a valid CSV file (.csv)');
                e.target.value = '';
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setNavOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchBundleSizes(selectedNetwork);
    }, [selectedNetwork]);

    return (
        <>
            <Head title="debkinsdata - become a data reseller">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-slate-100 overflow-x-hidden">
                {/* Navigation */}
                <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
                        : 'bg-white/90 backdrop-blur-lg'
                } border-b border-white/20`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-2">
                            <div className="text-2xl  text-yellow-500 font-black  bg-clip-text ">
                              <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-60 h-20 mb-4 mx-auto rounded-3xl" />
                            </div>
                            {/* Hamburger for mobile */}
                            <button
                                className="lg:hidden flex items-center px-3 py-2 border rounded text-gray-700 border-gray-300 focus:outline-none"
                                onClick={() => setNavOpen(!navOpen)}
                                aria-label="Toggle navigation"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Desktop nav */}
                            <div className="hidden lg:flex space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={auth.user.role === 'admin' ? route('admin.dashboard') :  route('dashboard')}
                                        className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="px-6 py-2 text-gray-700 font-medium rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            Register
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-6 py-2 text-gray-700 font-medium rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Mobile nav dropdown */}
                        <div className={`lg:hidden transition-all duration-300 ${navOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden`}> 
                            <div className="flex flex-col space-y-2 pb-4">
                                {auth.user ? (
                                    <Link
                                        href={auth.user.role === 'admin' ? route('admin.dashboard') :  route('dashboard')}
                                        className="block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                        onClick={() => setNavOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="block px-6 py-3 text-gray-700 font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Register
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="block px-6 py-3 text-gray-700 font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <a
                                            href="https://chat.whatsapp.com/D55nQdHcu3cFlWllWxadyI"
                                            className="block px-6 py-3 text-gray-700 font-medium rounded-full text-center hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-600 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                                            onClick={() => setNavOpen(false)}
                                        >
                                            Join Community
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Place Order Section - Show for all users */}
                <section className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 mt-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Welcome Text */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Welcome to DebkinsDataPlug!!
                            </h1>
                            <p className="text-lg text-gray-600">
                                Your one stop shop for internet data bundles.
                            </p>
                        </div>
                        
                        {/* Place Order Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Place Order</h3>
                            </div>

                            <div className="p-6">
                                {/* Network Selection */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                    {networks.map((network) => (
                                        <button
                                            key={network.id}
                                            onClick={() => handleNetworkChange(network.id)}
                                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                                                selectedNetwork === network.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${network.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                                    <img src={network.icon} alt={`${network.name} logo`} className="text-white text-lg sm:text-xl rounded-full" />
                                                </div>
                                                <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{network.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Order Type Selection */}
                                <div className="flex space-x-4 mb-6">
                                    <button
                                        onClick={() => setOrderType('excel')}
                                        className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                                            orderType === 'excel'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        📄 CSV
                                    </button>
                                    <button
                                        onClick={() => setOrderType('bulk')}
                                        className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                                            orderType === 'bulk'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        📦 Bulk
                                    </button>
                                    <button
                                        onClick={() => setOrderType('single')}
                                        className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                                            orderType === 'single'
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        ➕ Single
                                    </button>
                                </div>

                                {/* Order Form */}
                                {orderType === 'excel' && (
                                    <div className="space-y-4">
                                        <div 
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                                                isDragOver 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                            }`}
                                            onDragEnter={handleDragEnter}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <div className="text-blue-500 text-4xl mb-4">📊</div>
                                            <div className="text-gray-600 dark:text-gray-400 mb-4">
                                                {isDragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                                            </div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="excel-upload"
                                            />
                                            <label 
                                                htmlFor="excel-upload" 
                                                className="cursor-pointer inline-block px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-4"
                                            >
                                                Choose File
                                            </label>
                                            {excelFile && (
                                                <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                                                    ✅ Selected: {excelFile.name} ({(excelFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                Supported format: .csv only
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={handleProcessExcel}
                                            disabled={!excelFile || isProcessing}
                                            className={`w-full ${getNetworkButtonColors(selectedNetwork)} text-white`}
                                        >
                                            {isProcessing ? 'Processing...' : 'Process & Add to Cart'}
                                        </Button>
                                    </div>
                                )}

                                {orderType === 'bulk' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone Numbers (Phone Size)</label>
                                            <Textarea
                                                placeholder="0241234567 5&#10;0558765432 10&#10;0501234567 3"
                                                value={bulkNumbers}
                                                onChange={(e) => setBulkNumbers(e.target.value)}
                                                rows={6}
                                                className="w-full"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleProcessBulk}
                                            disabled={!bulkNumbers.trim() || isProcessing}
                                            className={`w-full ${getNetworkButtonColors(selectedNetwork)} text-white`}
                                        >
                                            {isProcessing ? 'Processing...' : 'Add Bulk to Cart'}
                                        </Button>
                                    </div>
                                )}

                                {orderType === 'single' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                                            <Input
                                                type="tel"
                                                placeholder="0240000000"
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    const cleaned = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 10);
                                                    setPhoneNumber(cleaned);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Bundle Size (GB)</label>
                                            <Select value={bundleSize} onValueChange={setBundleSize}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingSizes ? "Loading sizes..." : "Select size"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSizes.map((size) => (
                                                        <SelectItem key={size.value} value={size.value}>
                                                            {size.label} - GHS {size.price}
                                                        </SelectItem>
                                                    ))}
                                                    {availableSizes.length === 0 && !loadingSizes && (
                                                        <SelectItem value="no-sizes" disabled>
                                                            No sizes available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button 
                                            onClick={handleAddSingle}
                                            disabled={!phoneNumber || !bundleSize || isProcessing}
                                            className={`w-full ${getNetworkButtonColors(selectedNetwork)} text-white`}
                                        >
                                            Add to Cart
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cart Items Section - Only show if user is logged in */}
                        {auth.user && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🛒 Cart Items</h3>
                                        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                            {cartCount} items
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 text-4xl mb-4">🛒</div>
                                            <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                            item.product.network === 'MTN' ? 'bg-yellow-500' :
                                                            item.product.network === 'TELECEL' ? 'bg-red-500' :
                                                            item.product.network === 'ISHARE' ? 'bg-blue-500' :
                                                            item.product.network === 'BIGTIME' ? 'bg-purple-500' : 'bg-gray-500'
                                                        }`}>
                                                            <span className="text-white text-xs font-bold">{item.product.network.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{item.beneficiary_number}</div>
                                                            <div className="text-sm text-gray-500">{item.quantity} - {item.product.network}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-bold text-orange-600">GHS {Number(item.product.price || 0).toFixed(2)}</span>
                                                        <button 
                                                            onClick={() => handleRemoveFromCart(item.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <div className="border-t pt-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-lg font-semibold">Subtotal:</span>
                                                    <span className="text-xl font-bold">GHS {cartItems.reduce((sum, item) => sum + Number(item.product.price || 0), 0).toFixed(2)}</span>
                                                </div>
                                                <Button 
                                                    onClick={() => router.visit('/checkout')}
                                                    className={`w-full ${getNetworkButtonColors(selectedNetwork)} text-white font-semibold py-3`}
                                                >
                                                    💳 Make Payment ( GHS {cartItems.reduce((sum, item) => sum + Number(item.product.price || 0), 0).toFixed(2)} )
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}