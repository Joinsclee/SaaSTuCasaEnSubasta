interface StreetViewOptions {
  size?: string;
  heading?: number;
  pitch?: number;
  fov?: number;
}

export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/streetview';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured - property images will use placeholders');
    }
  }

  async getStreetViewImage(address: string, options: StreetViewOptions = {}): Promise<string> {
    if (!this.apiKey) {
      // Return placeholder URL if no API key
      return this.getPlaceholderImageUrl();
    }

    const params = new URLSearchParams({
      location: address,
      size: options.size || '640x400',
      key: this.apiKey,
      ...(options.heading !== undefined && { heading: options.heading.toString() }),
      ...(options.pitch !== undefined && { pitch: options.pitch.toString() }),
      ...(options.fov !== undefined && { fov: options.fov.toString() })
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async getMultipleAngles(address: string, angles: number[] = [0, 90, 180, 270]): Promise<Array<{url: string, heading: number, caption: string}>> {
    const images = [];
    
    for (const heading of angles) {
      const url = await this.getStreetViewImage(address, {
        size: '640x400',
        heading,
        pitch: -10,
        fov: 75
      });
      
      images.push({
        url,
        heading,
        caption: this.getDirectionCaption(heading)
      });
    }
    
    return images;
  }

  private getDirectionCaption(heading: number): string {
    if (heading >= 315 || heading < 45) return 'Vista Norte';
    if (heading >= 45 && heading < 135) return 'Vista Este';
    if (heading >= 135 && heading < 225) return 'Vista Sur';
    return 'Vista Oeste';
  }

  private getPlaceholderImageUrl(): string {
    // Return a placeholder image URL or local placeholder
    return '/api/placeholder-property-image';
  }

  // Validate if Street View is available for location
  async isStreetViewAvailable(address: string): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata`;
      const params = new URLSearchParams({
        location: address,
        key: this.apiKey
      });

      const response = await fetch(`${metadataUrl}?${params.toString()}`);
      const data = await response.json();
      
      return data.status === 'OK';
    } catch (error) {
      console.error('Error checking Street View availability:', error);
      return false;
    }
  }

  // Get property aerial view using Google Static Maps
  async getAerialView(address: string): Promise<string> {
    if (!this.apiKey) {
      return this.getPlaceholderImageUrl();
    }

    const params = new URLSearchParams({
      center: address,
      zoom: '18',
      size: '640x400',
      maptype: 'satellite',
      key: this.apiKey
    });

    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  }
}

export const googleMapsService = new GoogleMapsService();