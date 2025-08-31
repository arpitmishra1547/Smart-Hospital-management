import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const city = searchParams.get('city');
  
  // Use API key from config.js
  const apiKey = config.googleMaps.apiKey;


  if (!query && !city) {
    return NextResponse.json({ error: 'Query or city parameter is required' }, { status: 400 });
  }

  // Build search query for hospitals in the specified city
  const searchQuery = city ? `hospitals in ${city}` : query;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=hospital&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      // Filter and format hospital data
      const hospitals = data.results
        .filter(place => place.types.includes('hospital') || place.name.toLowerCase().includes('hospital'))
        .map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating,
          location: place.geometry.location
        }));
      
      return NextResponse.json({ 
        success: true, 
        hospitals,
        total: hospitals.length 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.error_message || 'Failed to fetch hospitals',
        status: data.status 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Maps API request failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data from Google Maps API' 
    }, { status: 500 });
  }
}
