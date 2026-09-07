'use client'

import { useState, useEffect } from 'react'
import { X, User, Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'login' | 'register'
    onSwitchMode: () => void
}

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
    // Common fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [googleReady, setGoogleReady] = useState(false)

    // Registration fields
    const [userType, setUserType] = useState<'user' | 'recycler' | null>(null)
    const [step, setStep] = useState(1)

    // User fields
    const [name, setName] = useState('')

    // Recycler fields
    const [businessName, setBusinessName] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [phone, setPhone] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [pinCode, setPinCode] = useState('')
    const [ewasteTypes, setEwasteTypes] = useState<string[]>([])
    const [operatingHours, setOperatingHours] = useState('')
    const [businessLicense, setBusinessLicense] = useState('')
    const [certifications, setCertifications] = useState('')
    const [website, setWebsite] = useState('')

    const API_URL = '/api'
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    const ewasteOptions = [
        'Phones & Tablets',
        'Laptops & Computers',
        'TVs & Monitors',
        'Home Appliances',
        'Batteries',
        'Cables & Accessories',
        'Other Electronics'
    ]

    // Load Google Sign-In script
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return

        const loadGoogleScript = () => {
            if (document.getElementById('google-signin-script')) {
                setGoogleReady(true)
                return
            }

            const script = document.createElement('script')
            script.src = 'https://accounts.google.com/gsi/client'
            script.id = 'google-signin-script'
            script.async = true
            script.defer = true
            script.onload = () => setGoogleReady(true)
            document.head.appendChild(script)
        }

        loadGoogleScript()
    }, [GOOGLE_CLIENT_ID])

    // Reset form when modal opens/closes or mode changes
    useEffect(() => {
        if (!isOpen) {
            resetForm()
        }
    }, [isOpen, mode])

    const resetForm = () => {
        setEmail('')
        setPassword('')
        setName('')
        setUserType(null)
        setStep(1)
        setError('')
        // Reset recycler fields
        setBusinessName('')
        setContactPerson('')
        setPhone('')
        setStreet('')
        setCity('')
        setState('')
        setPinCode('')
        setEwasteTypes([])
        setOperatingHours('')
        setBusinessLicense('')
        setCertifications('')
        setWebsite('')
    }

    const handleEwasteTypeToggle = (type: string) => {
        setEwasteTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const contentType = response.headers.get("content-type");
            const data = contentType && contentType.includes("application/json") ? await response.json() : {};

            if (!response.ok) {
                throw new Error(data.detail || `Login failed (${response.status})`)
            }

            // Cookies are set by the API
            window.location.reload()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const body: any = {
                email,
                password,
                role: userType
            }

            if (userType === 'user') {
                body.name = name
            } else if (userType === 'recycler') {
                body.name = contactPerson
                body.businessName = businessName
                body.contactPerson = contactPerson
                body.phone = phone
                body.address = {
                    street,
                    city,
                    state,
                    pinCode
                }
                body.ewasteTypes = ewasteTypes
                body.operatingHours = operatingHours
                body.businessLicense = businessLicense
                body.certifications = certifications
                body.website = website
            }

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const contentType = response.headers.get("content-type");
            const data = contentType && contentType.includes("application/json") ? await response.json() : {};

            if (!response.ok) {
                throw new Error(data.detail || `Registration failed (${response.status})`)
            }

            // Cookies are set by the API
            window.location.reload()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        if (!GOOGLE_CLIENT_ID) {
            setError('Google Sign-In not configured. Email/password login works great!')
            return
        }

        if (!googleReady || !window.google?.accounts?.id) {
            setError('Google Sign-In is loading. Please wait a moment...')
            return
        }

        setLoading(true)
        setError('')

        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: any) => {
                    try {
                        const res = await fetch(`${API_URL}/auth/google`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_token: response.credential }),
                        })

                        const contentType = res.headers.get("content-type");
                        const data = contentType && contentType.includes("application/json") ? await res.json() : {};
                        if (!res.ok) throw new Error(data.detail || `Google login failed (${res.status})`)

                        // Cookies are set by the API
                        window.location.reload()
                    } catch (err: any) {
                        setError(err.message || 'Google login failed. Try email/password instead.')
                        setLoading(false)
                    }
                },
            })

            const buttonDiv = document.createElement('div')
            buttonDiv.style.display = 'none'
            document.body.appendChild(buttonDiv)

            window.google.accounts.id.renderButton(buttonDiv, {
                type: 'standard',
                size: 'large',
            })

            setTimeout(() => {
                const googleButton = buttonDiv.querySelector('div[role="button"]') as HTMLElement
                if (googleButton) {
                    googleButton.click()
                } else {
                    setError('Failed to open Google Sign-In. Please try again.')
                    setLoading(false)
                }
                setTimeout(() => document.body.removeChild(buttonDiv), 1000)
            }, 100)
        } catch (err: any) {
            setError('Failed to initialize Google Sign-In. Use email/password instead.')
            setLoading(false)
        }
    }

    const canProceedToStep2 = () => {
        if (userType === 'recycler') {
            return businessName && contactPerson && email && password && phone
        }
        return false
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-6 h-6" />
                </button>

                {mode === 'login' ? (
                    // Login Form
                    <>
                        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                            Welcome Back
                        </h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                            Sign in to continue
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Please wait...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={!googleReady || loading}
                            className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            {!googleReady ? 'Loading Google...' : 'Continue with Google'}
                        </button>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchMode}
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Sign up
                            </button>
                        </p>
                    </>
                ) : (
                    // Registration Form
                    <>
                        {!userType ? (
                            // Step 0: Choose User Type
                            <>
                                <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                                    Join E-Connecto
                                </h2>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                                    Choose how you want to register
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setUserType('user')}
                                        className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                                    >
                                        <User className="w-12 h-12 mx-auto mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                            I'm a User
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            I want to recycle my e-waste and earn eco-points
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => setUserType('recycler')}
                                        className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                                    >
                                        <Building2 className="w-12 h-12 mx-auto mb-4 text-green-600 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                            I'm a Recycler
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            I collect and process e-waste from users
                                        </p>
                                    </button>
                                </div>

                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={onSwitchMode}
                                        className="text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </>
                        ) : userType === 'user' ? (
                            // User Registration Form
                            <>
                                <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                                    Create Account
                                </h2>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                    Join E-Connecto as a User
                                </p>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            onClick={() => setUserType(null)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back
                                        </Button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Creating...' : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            // Recycler Registration Form (Multi-step)
                            <>
                                <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                                    Recycler Registration
                                </h2>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                    Step {step} of 2
                                </p>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    {step === 1 ? (
                                        // Step 1: Basic Information
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Business Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="Green Recyclers Pvt Ltd"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Contact Person Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={contactPerson}
                                                    onChange={(e) => setContactPerson(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="contact@greenrecyclers.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            {error && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => setUserType(null)}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => setStep(2)}
                                                    disabled={!canProceedToStep2()}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    Next
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        // Step 2: Business Details
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Street Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={street}
                                                    onChange={(e) => setStreet(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="123 Main Street"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={city}
                                                        onChange={(e) => setCity(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                        placeholder="Mumbai"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={state}
                                                        onChange={(e) => setState(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                        placeholder="Maharashtra"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    PIN Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={pinCode}
                                                    onChange={(e) => setPinCode(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="400001"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Types of E-Waste Accepted *
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {ewasteOptions.map((option) => (
                                                        <label
                                                            key={option}
                                                            className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={ewasteTypes.includes(option)}
                                                                onChange={() => handleEwasteTypeToggle(option)}
                                                                className="w-4 h-4 text-green-600 rounded"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Operating Hours *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={operatingHours}
                                                    onChange={(e) => setOperatingHours(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="Mon-Sat: 9AM-6PM"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Business License Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={businessLicense}
                                                    onChange={(e) => setBusinessLicense(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="LIC123456789"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Certifications (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={certifications}
                                                    onChange={(e) => setCertifications(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="ISO 14001, R2 Certified"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Website (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    placeholder="https://greenrecyclers.com"
                                                />
                                            </div>

                                            {error && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
                                                Your account will be pending verification. You'll be notified once approved.
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Back
                                                </Button>
                                                <button
                                                    type="submit"
                                                    disabled={loading || ewasteTypes.length === 0}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? 'Registering...' : 'Complete Registration'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
