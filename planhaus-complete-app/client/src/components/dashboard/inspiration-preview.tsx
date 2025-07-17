import { Heart, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const inspirationImages = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    alt: 'Garden wedding ceremony',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    alt: 'Wedding bouquet',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    alt: 'Wedding reception',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    alt: 'Wedding cake',
  },
];

const colorPalette = [
  'bg-pink-200',
  'bg-white border border-gray-200',
  'bg-green-200',
  'bg-yellow-100',
];

export default function InspirationPreview() {
  const [, setLocation] = useLocation();

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gray-800">Inspiration Board</h3>
        <Button 
          variant="ghost" 
          className="text-blush hover:text-rose-gold"
          onClick={() => setLocation('/inspiration')}
        >
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inspirationImages.map((image) => (
          <div key={image.id} className="relative rounded-lg overflow-hidden aspect-square group">
            <img 
              src={image.url} 
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <Heart className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between p-4 bg-soft-gold rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-champagne rounded-lg flex items-center justify-center">
            <Palette className="text-white" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">AI Color Palette Generated</p>
            <p className="text-sm text-gray-600">Based on your inspiration photos</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {colorPalette.map((color, index) => (
            <div key={index} className={`w-6 h-6 ${color} rounded-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}
