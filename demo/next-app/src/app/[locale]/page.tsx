import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  [x: string]: any;
}

const Button = ({ children, className = '', variant = 'default', ...props }: ButtonProps) => {
  const baseStyles = "text-sm font-medium transition-all duration-200 ease-in-out"
  const variantStyles = {
    default: "bg-white hover:bg-gray-100 text-black rounded-full shadow-lg hover:shadow-xl",
    outline: "bg-transparent text-white border border-white hover:bg-white hover:text-black"
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navbar */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                Replexica
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#" className="text-sm hover:text-green-400 transition-colors">
                Products
              </Link>
              <Link href="#" className="text-sm hover:text-green-400 transition-colors">
                Solutions
              </Link>
              <Link href="#" className="text-sm hover:text-green-400 transition-colors">
                Pricing
              </Link>
              <Link href="#" className="text-sm hover:text-green-400 transition-colors">
                Docs
              </Link>
            </nav>
            <div>
              <Button 
                variant="outline" 
                className="px-4 py-2"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 max-w-">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Instant <span className="text-green-400">AI localization</span> for multilingual software
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
              Get <span className="text-green-400">production-ready translations</span> in seconds, using Replexica AI engine.
            </p>
            <Button 
              className="py-3 px-8 text-base transform hover:scale-105"
            >
              Get started
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2023 Replexica. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
