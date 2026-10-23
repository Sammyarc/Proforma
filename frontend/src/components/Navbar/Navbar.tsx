import { ArrowRight } from 'lucide-react'
import Logo from '../../assets/Images/P-removebg-preview.png'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 w-full z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1">
          <img
            src={Logo}
            alt="Proforma Logo"
            className="w-10 h-10 md:w-11 md:h-11"
          />
          <span className="font-clash text-heading-sm text-neutral-900">
            Proforma
          </span>
        </a>

        {/* CTA */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/signup')}
          className="gap-1.5"
        >
          Generate
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}
