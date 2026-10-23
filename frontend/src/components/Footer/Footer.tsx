import Logo from '../../assets/Images/P-removebg-preview.png'
import { FaFacebookF } from 'react-icons/fa'
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6'
import { IoLogoInstagram } from 'react-icons/io5'

const socialLinks = [
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
  { icon: FaXTwitter, label: 'Twitter', href: '#' },
  { icon: FaLinkedin, label: 'LinkedIn', href: '#' },
  { icon: IoLogoInstagram, label: 'Instagram', href: '#' },
]

const quickLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Support', href: '#support' },
  { label: 'Contact Us', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8">
        <div className="lg:flex lg:justify-between lg:items-start">
          {/* About */}
          <div className="mb-8 lg:mb-0 max-w-sm">
            <a href="/" className="flex items-center gap-1 mb-3">
              <img src={Logo} alt="Proforma Logo" className="w-10 h-10" />
              <span className="font-clash text-heading-sm text-neutral-900">
                Proforma
              </span>
            </a>
            <p className="text-body-sm text-neutral-500 font-satoshi leading-relaxed">
              Our invoice generator app simplifies the way businesses and
              freelancers manage their billing needs. Create, send, and manage
              professional invoices seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-body-sm font-semibold font-satoshi text-neutral-800 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-body-sm text-neutral-500 hover:text-neutral-800 font-satoshi transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h3 className="text-body-sm font-semibold font-satoshi text-neutral-800 mb-4">
                Socials
              </h3>
              <div className="flex flex-col gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="text-neutral-400 hover:text-neutral-800 transition-colors"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-200 mt-10 pt-6 text-center">
          <p className="text-body-sm text-neutral-400 font-satoshi">
            &copy; {new Date().getFullYear()} Proforma. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
