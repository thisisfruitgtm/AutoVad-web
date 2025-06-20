import posthog from 'posthog-js';

// Analytics event types
export interface SearchEvent {
  query: string;
  filters?: Record<string, any>;
  resultsCount?: number;
}

export interface FilterEvent {
  filterType: string;
  filterValue: any;
  previousFilters?: Record<string, any>;
}

export interface CarViewEvent {
  carId: string;
  carTitle?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  carPrice?: number;
  source?: 'search' | 'browse' | 'liked' | 'recommendation';
}

export interface LikeEvent {
  carId: string;
  carTitle?: string;
  action: 'like' | 'unlike';
}

export interface ShareEvent {
  carId: string;
  carTitle?: string;
  platform?: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy_link';
}

export interface CommentEvent {
  carId: string;
  carTitle?: string;
  commentLength?: number;
  action: 'add' | 'edit' | 'delete';
}

export interface AuthEvent {
  method: 'email' | 'google';
  action: 'register' | 'login' | 'logout';
  success: boolean;
  error?: string;
}

export interface CarPostEvent {
  carId?: string;
  carTitle?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  carPrice?: number;
  hasImages: boolean;
  hasVideos: boolean;
  imagesCount?: number;
  videosCount?: number;
  action: 'create' | 'edit' | 'delete';
  success: boolean;
  error?: string;
}

// Analytics utility class
export class Analytics {
  // Search events
  static trackSearch(event: SearchEvent) {
    posthog.capture('search_performed', {
      query: event.query,
      filters: event.filters,
      results_count: event.resultsCount,
      timestamp: new Date().toISOString(),
    });
  }

  // Filter events
  static trackFilter(event: FilterEvent) {
    posthog.capture('filter_applied', {
      filter_type: event.filterType,
      filter_value: event.filterValue,
      previous_filters: event.previousFilters,
      timestamp: new Date().toISOString(),
    });
  }

  // Car view events
  static trackCarView(event: CarViewEvent) {
    posthog.capture('car_viewed', {
      car_id: event.carId,
      car_title: event.carTitle,
      car_brand: event.carBrand,
      car_model: event.carModel,
      car_year: event.carYear,
      car_price: event.carPrice,
      source: event.source,
      timestamp: new Date().toISOString(),
    });
  }

  // Like events
  static trackLike(event: LikeEvent) {
    posthog.capture('car_liked', {
      car_id: event.carId,
      car_title: event.carTitle,
      action: event.action,
      timestamp: new Date().toISOString(),
    });
  }

  // Share events
  static trackShare(event: ShareEvent) {
    posthog.capture('car_shared', {
      car_id: event.carId,
      car_title: event.carTitle,
      platform: event.platform,
      timestamp: new Date().toISOString(),
    });
  }

  // Comment events
  static trackComment(event: CommentEvent) {
    posthog.capture('comment_action', {
      car_id: event.carId,
      car_title: event.carTitle,
      comment_length: event.commentLength,
      action: event.action,
      timestamp: new Date().toISOString(),
    });
  }

  // Authentication events
  static trackAuth(event: AuthEvent) {
    posthog.capture('auth_action', {
      method: event.method,
      action: event.action,
      success: event.success,
      error: event.error,
      timestamp: new Date().toISOString(),
    });
  }

  // Car posting events
  static trackCarPost(event: CarPostEvent) {
    posthog.capture('car_post_action', {
      car_id: event.carId,
      car_title: event.carTitle,
      car_brand: event.carBrand,
      car_model: event.carModel,
      car_year: event.carYear,
      car_price: event.carPrice,
      has_images: event.hasImages,
      has_videos: event.hasVideos,
      images_count: event.imagesCount,
      videos_count: event.videosCount,
      action: event.action,
      success: event.success,
      error: event.error,
      timestamp: new Date().toISOString(),
    });
  }

  // Utility methods
  static identify(userId: string, properties?: Record<string, any>) {
    posthog.identify(userId, properties);
  }

  static setUserProperties(properties: Record<string, any>) {
    posthog.people.set(properties);
  }

  static trackPageView(pageName: string, properties?: Record<string, any>) {
    posthog.capture('page_viewed', {
      page_name: pageName,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  static trackError(error: Error, context?: Record<string, any>) {
    posthog.capture('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

// Convenience functions for common events
export const trackSearch = Analytics.trackSearch;
export const trackFilter = Analytics.trackFilter;
export const trackCarView = Analytics.trackCarView;
export const trackLike = Analytics.trackLike;
export const trackShare = Analytics.trackShare;
export const trackComment = Analytics.trackComment;
export const trackAuth = Analytics.trackAuth;
export const trackCarPost = Analytics.trackCarPost; 