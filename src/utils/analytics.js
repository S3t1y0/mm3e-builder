import { track } from '@vercel/analytics';

/**
 * Safe, centralized event tracking for Vercel Web Analytics.
 * Handles graceful degradation in local dev and environments where adblockers might be present.
 *
 * @param {string} name - Event name (snake_case convention, e.g. 'share_hero_copied')
 * @param {Record<string, any>} [properties={}] - Event metadata properties
 */
export function trackEvent(name, properties = {}) {
  try {
    // Track in production
    track(name, properties);

    // Development console logging for easy debugging and verification
    if (typeof window !== 'undefined' && import.meta.env?.DEV) {
      console.debug(
        `%c[Analytics Event]%c ${name}`,
        'background: #0284c7; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: #38bdf8; font-weight: bold;',
        properties
      );
    }
  } catch (err) {
    // Fail-safe: never throw unhandled errors or block user experience
  }
}
