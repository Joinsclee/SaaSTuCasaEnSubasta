import { AttomService } from './attomService';
import { storage } from '../storage';
import { GoogleMapsService } from './googleMapsService';
import type { InsertProperty } from '@shared/schema';

interface PropertySyncResult {
  added: number;
  updated: number;
  errors: number;
  totalProcessed: number;
}

interface SyncOptions {
  states?: string[];
  maxProperties?: number;
  forceUpdate?: boolean;
}

export class PropertyDataSync {
  private attomService: AttomService;
  private googleMapsService: GoogleMapsService;

  constructor() {
    this.attomService = new AttomService();
    this.googleMapsService = new GoogleMapsService();
  }

  async syncAllStates(options: SyncOptions = {}): Promise<PropertySyncResult> {
    const result: PropertySyncResult = {
      added: 0,
      updated: 0,
      errors: 0,
      totalProcessed: 0
    };

    const statesToSync = options.states || [
      'FL', 'CA', 'TX', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'
    ];

    console.log(`Starting property sync for ${statesToSync.length} states`);

    for (const state of statesToSync) {
      try {
        const stateResult = await this.syncStateProperties(state, options);
        result.added += stateResult.added;
        result.updated += stateResult.updated;
        result.errors += stateResult.errors;
        result.totalProcessed += stateResult.totalProcessed;

        // Add delay between states to respect API limits
        await this.delay(2000);
      } catch (error) {
        console.error(`Error syncing state ${state}:`, error);
        result.errors++;
      }
    }

    console.log(`Sync completed: ${result.added} added, ${result.updated} updated, ${result.errors} errors`);
    return result;
  }

  private async syncStateProperties(state: string, options: SyncOptions): Promise<PropertySyncResult> {
    const result: PropertySyncResult = {
      added: 0,
      updated: 0,
      errors: 0,
      totalProcessed: 0
    };

    let page = 1;
    const pageSize = 25;
    let hasMoreData = true;

    while (hasMoreData && result.totalProcessed < (options.maxProperties || 1000)) {
      try {
        // Fetch properties from ATTOM Data
        const foreclosureData = await this.attomService.getForeclosureProperties({
          state,
          page,
          pageSize
        });

        if (!foreclosureData.property || foreclosureData.property.length === 0) {
          hasMoreData = false;
          break;
        }

        // Process each property
        for (const attomProperty of foreclosureData.property) {
          try {
            const transformedProperty = this.attomService.transformToAuctionProperty(attomProperty, result.totalProcessed);
            
            // Check if property exists in database
            const existingProperty = await storage.getPropertyByAddress(
              transformedProperty.address,
              transformedProperty.city,
              transformedProperty.state
            );

            if (existingProperty && !options.forceUpdate) {
              // Property exists, check if update needed
              const daysSinceUpdate = this.getDaysSince(existingProperty.createdAt);
              if (daysSinceUpdate < 1) {
                continue; // Skip if updated recently
              }
            }

            // Generate or update property images
            await this.syncPropertyImages(transformedProperty);

            if (existingProperty) {
              await storage.updateProperty(existingProperty.id, {
                ...transformedProperty,
                lastSynced: new Date()
              });
              result.updated++;
            } else {
              const propertyData: InsertProperty = {
                ...transformedProperty,
                dataSource: "ATTOM",
                lastSynced: new Date()
              };
              await storage.createProperty(propertyData);
              result.added++;
            }

            result.totalProcessed++;

            // Add small delay between properties
            await this.delay(100);
          } catch (propertyError) {
            console.error(`Error processing property:`, propertyError);
            result.errors++;
          }
        }

        page++;
        
        // Check if we've reached the end
        if (foreclosureData.property.length < pageSize) {
          hasMoreData = false;
        }

      } catch (pageError) {
        console.error(`Error fetching page ${page} for state ${state}:`, pageError);
        result.errors++;
        hasMoreData = false;
      }
    }

    console.log(`State ${state} sync: ${result.added} added, ${result.updated} updated`);
    return result;
  }

  private async syncPropertyImages(property: any): Promise<void> {
    try {
      // Generate Google Street View image URL
      const streetViewUrl = await this.googleMapsService.getStreetViewImage(
        `${property.address}, ${property.city}, ${property.state}`,
        {
          size: '640x400',
          heading: 0,
          pitch: -10,
          fov: 75
        }
      );

      // Update property with image URLs
      property.images = [
        {
          url: streetViewUrl,
          type: 'street_view',
          caption: 'Vista desde la calle'
        }
      ];

      // Generate additional angles for premium properties
      if (property.opportunityScore >= 4) {
        const additionalAngles = [90, 180, 270];
        for (const heading of additionalAngles) {
          const angleUrl = await this.googleMapsService.getStreetViewImage(
            `${property.address}, ${property.city}, ${property.state}`,
            {
              size: '640x400',
              heading,
              pitch: -10,
              fov: 75
            }
          );
          
          property.images.push({
            url: angleUrl,
            type: 'street_view',
            caption: `Vista ${this.getDirectionName(heading)}`
          });
        }
      }
    } catch (error) {
      console.error('Error generating property images:', error);
      // Use placeholder image
      property.images = [{
        url: '/api/placeholder-property-image',
        type: 'placeholder',
        caption: 'Imagen no disponible'
      }];
    }
  }

  private getDirectionName(heading: number): string {
    if (heading === 90) return 'Este';
    if (heading === 180) return 'Sur';
    if (heading === 270) return 'Oeste';
    return 'Norte';
  }

  private getDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Scheduled sync method (called by cron job)
  async performDailySync(): Promise<PropertySyncResult> {
    console.log('Starting daily property data sync...');
    
    const result = await this.syncAllStates({
      maxProperties: 500, // Limit for daily sync
      forceUpdate: false  // Only update old data
    });

    // Log results to database for monitoring
    await storage.logSyncResult({
      date: new Date(),
      added: result.added,
      updated: result.updated,
      errors: result.errors,
      totalProcessed: result.totalProcessed,
      type: 'daily_sync'
    });

    return result;
  }
}

export const propertyDataSync = new PropertyDataSync();