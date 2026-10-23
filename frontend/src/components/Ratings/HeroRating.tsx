import { Star } from 'lucide-react'
import Image1 from '../../assets/Images/gettyimages-1321081723-612x612.jpg'
import Image2 from '../../assets/Images/gettyimages-1431569188-612x612.jpg'
import Image3 from '../../assets/Images/gettyimages-1683003966-612x612.jpg'
import Image4 from '../../assets/Images/gettyimages-2162083704-612x612.jpg'

const userImages = [Image1, Image2, Image3, Image4]

export default function HeroRating() {
  return (
    <div className="flex items-center gap-3 mt-6">
      {/* Stacked avatars */}
      <div className="flex -space-x-3">
        {userImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`User ${i + 1}`}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ))}
      </div>

      <div className="flex flex-col gap-0.5">
        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <span className="text-body-sm text-neutral-500 font-satoshi font-medium">
          Satisfied customers
        </span>
      </div>
    </div>
  )
}
