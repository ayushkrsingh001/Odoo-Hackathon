/**
 * Default Trip Cover Images Library
 * A curated collection of 40 premium travel destination photos.
 * Used to automatically assign a beautiful cover image to new trips.
 */

const DEFAULT_TRIP_IMAGES = [
  // ── Beaches ──
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', // Tropical beach
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=500&fit=crop', // Ocean beach
  'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&h=500&fit=crop', // Sunset beach
  'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&h=500&fit=crop', // Palm beach
  
  // ── Goa ──
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=500&fit=crop', // Goa beach
  'https://images.unsplash.com/photo-1587922546307-776227941871?w=800&h=500&fit=crop', // Goa coastline
  
  // ── Maldives ──
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=500&fit=crop', // Maldives overwater
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=500&fit=crop', // Maldives turquoise
  
  // ── Bali ──
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop', // Bali temple
  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=500&fit=crop', // Bali rice terraces
  
  // ── Mountains ──
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', // Mountain peaks
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', // Starry mountains
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=500&fit=crop', // Himalayan peaks
  
  // ── Switzerland ──
  'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=500&fit=crop', // Swiss Alps
  'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800&h=500&fit=crop', // Swiss village
  
  // ── Leh Ladakh ──
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=500&fit=crop', // Ladakh landscape
  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=500&fit=crop', // Pangong Lake
  
  // ── Snow Landscapes ──
  'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&h=500&fit=crop', // Snowy mountains
  'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=800&h=500&fit=crop', // Winter wonderland
  
  // ── Kerala ──
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop', // Kerala backwaters
  'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&h=500&fit=crop', // Kerala houseboat
  
  // ── Paris ──
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=500&fit=crop', // Paris cityscape
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop', // Eiffel Tower
  
  // ── Dubai ──
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop', // Dubai skyline
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=500&fit=crop', // Dubai desert
  
  // ── Japan ──
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop', // Japan temple
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&h=500&fit=crop', // Tokyo night
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=500&fit=crop', // Cherry blossoms
  
  // ── New York ──
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop', // NYC skyline
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=500&fit=crop', // Times Square
  
  // ── Cities ──
  'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&h=500&fit=crop', // Venice canals
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=500&fit=crop', // Rome Colosseum
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=800&h=500&fit=crop', // Santorini
  'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=800&h=500&fit=crop', // Istanbul
  
  // ── Tropical Islands ──
  'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&h=500&fit=crop', // Tropical island
  'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=500&fit=crop', // Thailand islands
  
  // ── Cultural Landmarks ──
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=500&fit=crop', // Taj Mahal
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=500&fit=crop', // Jaipur palace
  
  // ── Adventure ──
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop', // Road trip
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop', // Lake & mountains
];

/**
 * Returns a random image URL from the curated travel image collection.
 * @returns {string} A random travel image URL
 */
export function getRandomTripImage() {
  const index = Math.floor(Math.random() * DEFAULT_TRIP_IMAGES.length);
  return DEFAULT_TRIP_IMAGES[index];
}

export default DEFAULT_TRIP_IMAGES;
