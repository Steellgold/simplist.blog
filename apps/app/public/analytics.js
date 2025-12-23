/**
 * Simplist Analytics Widget
 *
 * Usage:
 *
 * Simple (auto-detects article slug from URL):
 * <script src="https://cdn.simplist.blog/analytics.js" data-api-key="pk_your_key"></script>
 *
 * With explicit slug:
 * <script src="https://cdn.simplist.blog/analytics.js" data-api-key="pk_your_key" data-slug="my-article"></script>
 *
 * Notes:
 * - data-api-key: Required. Your public API key (starts with pk_)
 * - data-slug: Optional. Auto-detects from URL if not provided (uses last path segment)
 * - data-api-url: Optional. Override API endpoint
 * - data-debug: Optional. Set to "true" to enable debug logs
 */

(function() {
  'use strict';

  // Get script element to check for data attributes
  const scriptElement = document.currentScript || document.querySelector('script[src*="analytics.js"]');

  // Parse data attributes
  const dataAttrs = scriptElement ? {
    apiKey: scriptElement.getAttribute('data-api-key'),
    articleSlug: scriptElement.getAttribute('data-slug'),
    apiUrl: scriptElement.getAttribute('data-api-url'),
    debug: scriptElement.getAttribute('data-debug') === 'true'
  } : {};

  // Configuration from data attributes or global variable (data attrs take priority)
  const config = {
    ...(window.SimplistAnalytics || {}),
    ...Object.fromEntries(Object.entries(dataAttrs).filter(([, value]) => value !== null))
  };

  if (!config.apiKey) {
    console.warn('Simplist Analytics: API key not provided. Add data-api-key="pk_..." attribute to the script tag.');
    return;
  }

  // Auto-detect slug from URL pathname if not provided
  if (!config.articleSlug) {
    const pathname = window.location.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (lastSegment) {
      config.articleSlug = lastSegment;
      console.log('[Simplist Analytics] Auto-detected article slug from URL:', config.articleSlug);
    } else {
      console.warn('Simplist Analytics: Could not auto-detect article slug. Add data-slug="your-slug" attribute or ensure the URL has a path segment.');
      return;
    }
  }

  const API_URL = config.apiUrl || 'https://api.simplist.blog/v1';
  const DEBUG = config.debug || false;
  
  // Bot detection function
  const isBot = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Known bot patterns
    const botPatterns = [
      'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
      'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
      'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'screaming frog', 'seobilitybot',
      'pingdom', 'uptimerobot', 'monitor', 'nagios', 'zabbix',
      'bot', 'crawler', 'spider', 'scraper', 'fetch', 'curl', 'wget',
      'python-requests', 'go-http-client', 'axios', 'http', 'node',
      'headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'playwright'
    ];
    
    // Check if user agent matches any bot pattern
    for (const pattern of botPatterns) {
      if (userAgent.includes(pattern)) {
        return true;
      }
    }
    
    // Additional checks for automated access
    // Check if webdriver is present (automated browsers)
    if (window.navigator.webdriver) {
      return true;
    }
    
    // Check for missing features that real browsers should have
    if (!window.chrome && !window.safari && !window.opera && userAgent.includes('chrome')) {
      return true; // Headless Chrome often lacks window.chrome
    }
    
    return false;
  };

  // Check if this is a bot before initializing
  if (isBot()) {
    if (DEBUG) console.log('[Simplist Analytics] Bot detected, skipping analytics');
    return;
  }

  // Utility functions
  const log = (...args) => {
    if (DEBUG) console.log('[Simplist Analytics]', ...args);
  };

  const error = (...args) => {
    console.error('[Simplist Analytics]', ...args);
  };

  // Generate or retrieve persistent visitor ID
  const getOrCreateVisitorId = () => {
    const storageKey = 'simplist_visitor_id';
    
    // Try localStorage first (most persistent)
    let visitorId = localStorage.getItem(storageKey);
    
    // Fallback to sessionStorage
    if (!visitorId) {
      visitorId = sessionStorage.getItem(storageKey);
    }
    
    // Generate new ID if none exists
    if (!visitorId) {
      // Create a lightweight fingerprint for visitor identification
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset()
      ].join('|');
      
      // Create hash-like ID from fingerprint
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      visitorId = `visitor_${Math.abs(hash)}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Store in both localStorage and sessionStorage
      try {
        localStorage.setItem(storageKey, visitorId);
        sessionStorage.setItem(storageKey, visitorId);
      } catch (e) {
        // localStorage might be disabled, fallback to sessionStorage only
        sessionStorage.setItem(storageKey, visitorId);
      }
      
      log('Generated new visitor ID:', visitorId);
    } else {
      log('Using existing visitor ID:', visitorId);
    }
    
    return visitorId;
  };

  // Generate session ID
  const generateSessionId = () => {
    const stored = sessionStorage.getItem('simplist_session_id');
    if (stored) return stored;
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('simplist_session_id', sessionId);
    return sessionId;
  };

  // Get UTM parameters from URL
  const getUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source'),
      utmMedium: urlParams.get('utm_medium'),
      utmCampaign: urlParams.get('utm_campaign'),
      utmTerm: urlParams.get('utm_term'),
      utmContent: urlParams.get('utm_content')
    };
  };

  // Get screen dimensions
  const getScreenDimensions = () => {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  };

  // Calculate scroll depth
  const getScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    return Math.min(100, Math.round(((scrollTop + windowHeight) / documentHeight) * 100));
  };

  // Analytics state
  let pageViewId = null;
  let visitorId = getOrCreateVisitorId();
  let sessionId = generateSessionId();
  let startTime = Date.now();
  let maxScrollDepth = 0;
  let events = [];
  let isUnloading = false;
  let lastScrollTime = 0;
  
  // Track scroll depth
  const trackScroll = () => {
    const now = Date.now();
    // Throttle scroll events to every 100ms
    if (now - lastScrollTime < 100) return;
    lastScrollTime = now;
    
    const currentScrollDepth = getScrollDepth();
    if (currentScrollDepth > maxScrollDepth) {
      maxScrollDepth = currentScrollDepth;
      
      // Track scroll milestones
      if (currentScrollDepth >= 25 && !events.find(e => e.type === 'scroll_25')) {
        addEvent('scroll_milestone', { milestone: 25 }, currentScrollDepth);
      }
      if (currentScrollDepth >= 50 && !events.find(e => e.type === 'scroll_50')) {
        addEvent('scroll_milestone', { milestone: 50 }, currentScrollDepth);
      }
      if (currentScrollDepth >= 75 && !events.find(e => e.type === 'scroll_75')) {
        addEvent('scroll_milestone', { milestone: 75 }, currentScrollDepth);
      }
      if (currentScrollDepth >= 90 && !events.find(e => e.type === 'scroll_90')) {
        addEvent('scroll_milestone', { milestone: 90 }, currentScrollDepth);
      }
    }
  };

  // Add event to buffer
  const addEvent = (type, data = {}, position = null) => {
    events.push({
      type,
      data,
      position,
      timestamp: new Date().toISOString(),
      timeOffset: Date.now() - startTime
    });
    log('Event added:', type, data);
  };

  // Convert country code to full name
  const getCountryName = (countryCode) => {
    const countryNames = {
      'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 'FR': 'France',
      'DE': 'Germany', 'ES': 'Spain', 'IT': 'Italy', 'NL': 'Netherlands', 'BE': 'Belgium',
      'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark',
      'FI': 'Finland', 'JP': 'Japan', 'KR': 'South Korea', 'CN': 'China', 'IN': 'India',
      'AU': 'Australia', 'NZ': 'New Zealand', 'BR': 'Brazil', 'MX': 'Mexico', 'AR': 'Argentina',
      'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Peru', 'RU': 'Russia', 'UA': 'Ukraine',
      'PL': 'Poland', 'CZ': 'Czech Republic', 'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria',
      'HR': 'Croatia', 'SI': 'Slovenia', 'SK': 'Slovakia', 'LT': 'Lithuania', 'LV': 'Latvia',
      'EE': 'Estonia', 'IE': 'Ireland', 'PT': 'Portugal', 'GR': 'Greece', 'TR': 'Turkey',
      'IL': 'Israel', 'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates', 'EG': 'Egypt',
      'ZA': 'South Africa', 'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco', 'TH': 'Thailand',
      'VN': 'Vietnam', 'SG': 'Singapore', 'MY': 'Malaysia', 'ID': 'Indonesia', 'PH': 'Philippines',
      'TW': 'Taiwan', 'HK': 'Hong Kong'
    };
    return countryNames[countryCode] || countryCode;
  };

  // Fetch geographic data from ipinfo.io (HTTPS compatible)
  const fetchGeoData = async () => {
    try {
      const response = await fetch('https://ipinfo.io/json');
      if (response.ok) {
        const data = await response.json();
        if (data.country) {
          return {
            country: getCountryName(data.country),
            countryCode: data.country,
            region: data.region,
            city: data.city,
            timezone: data.timezone
          };
        }
      }
    } catch (err) {
      log('Failed to fetch geo data:', err);
    }
    return null;
  };

  // Send data to API
  const sendToAPI = async (endpoint, data, method = 'POST') => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      error('API request failed:', err);
      throw err;
    }
  };

  // Initial page view tracking
  const trackPageView = async () => {
    try {
      const utmParams = getUtmParams();
      const screenDims = getScreenDimensions();
      
      // Fetch geo data from client-side
      log('Fetching geo data...');
      const geoData = await fetchGeoData();
      
      const data = {
        articleSlug: config.articleSlug,
        visitorId,
        sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        ...utmParams,
        ...screenDims,
        ...geoData, // Include geo data from client
        timestamp: new Date().toISOString(),
        fetchGeo: false // Tell API not to fetch geo data
      };

      log('Tracking page view:', data);
      const result = await sendToAPI('/analytics/track', data);
      
      pageViewId = result.pageViewId;
      log('Page view tracked, ID:', pageViewId);
      
    } catch (err) {
      error('Failed to track page view:', err);
    }
  };

  // Update page view with final metrics
  const updatePageView = async () => {
    if (!pageViewId || isUnloading) return;
    
    try {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      const currentScrollDepth = getScrollDepth();
      
      const data = {
        timeOnPage,
        scrollDepth: Math.max(maxScrollDepth, currentScrollDepth),
        exitPosition: currentScrollDepth,
        bounced: timeOnPage < 10 && maxScrollDepth < 25, // Less than 10s and scrolled less than 25%
        events: events.length > 0 ? events : undefined
      };

      log('Updating page view:', data);
      await sendToAPI(`/analytics/track/${pageViewId}`, data, 'PUT');
      log('Page view updated successfully');
      
      // Clear events after sending
      events = [];
      
    } catch (err) {
      error('Failed to update page view:', err);
    }
  };

  // Handle page unload
  const handleUnload = () => {
    if (isUnloading) return;
    isUnloading = true;
    
    // Use sendBeacon for more reliable delivery on page unload
    if (navigator.sendBeacon && pageViewId) {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      const currentScrollDepth = getScrollDepth();
      
      const data = JSON.stringify({
        timeOnPage,
        scrollDepth: Math.max(maxScrollDepth, currentScrollDepth),
        exitPosition: currentScrollDepth,
        bounced: timeOnPage < 10 && maxScrollDepth < 25,
        events: events.length > 0 ? events : undefined
      });

      const success = navigator.sendBeacon(
        `${API_URL}/analytics/track/${pageViewId}`,
        new Blob([data], { type: 'application/json' })
      );
      
      log('Beacon sent:', success);
    } else {
      // Fallback to synchronous request (less reliable)
      updatePageView();
    }
  };

  // Handle visibility change (tab switching)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab is hidden, send current data
      updatePageView();
    } else {
      // Tab is visible again, reset start time for accurate time tracking
      startTime = Date.now();
      events = []; // Clear events when resuming
    }
  };

  // Initialize analytics
  const init = () => {
    log('Initializing Simplist Analytics for article:', config.articleSlug);
    
    // Track initial page view
    trackPageView();
    
    // Set up event listeners
    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Send updates periodically (every 30 seconds)
    setInterval(() => {
      if (!document.hidden && !isUnloading) {
        updatePageView();
      }
    }, 30000);
    
    // Track focus/blur events
    window.addEventListener('focus', () => addEvent('focus'));
    window.addEventListener('blur', () => addEvent('blur'));
    
    log('Analytics initialized successfully');
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

  // Expose API for manual event tracking
  window.SimplistAnalytics = window.SimplistAnalytics || {};
  window.SimplistAnalytics.track = (eventType, data = {}, position = null) => {
    addEvent(eventType, data, position);
  };

  window.SimplistAnalytics.flush = () => {
    updatePageView();
  };

})();