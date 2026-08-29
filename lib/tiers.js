/**
 * User Tiers & Quota Configurations
 * Leatherbound Notebook
 */

const TIER_CONFIGS = {
  classic: {
    id: 'classic',
    name: 'Classic Scribe',
    tagline: 'Free Forever',
    badge: '📜 Classic',
    maxBooks: 5,
    maxPagesPerBook: 20,
    maxTotalStorageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    maxVideoSizeBytes: 200 * 1024 * 1024, // 200 MB
    maxImageSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxAudioSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxDocSizeBytes: 50 * 1024 * 1024, // 50 MB
    allowedCovers: ['brown', 'green', 'navy'],
    hasWatermark: true,
    hasVoiceDictation: false,
    hasAiTools: false,
    hasCustomThemes: false,
    priorityEncryption: false,
  },
  premium: {
    id: 'premium',
    name: 'Guild Master',
    tagline: 'Unlimited Power',
    badge: '👑 Premium Scribe',
    maxBooks: 100,
    maxPagesPerBook: 1000,
    maxTotalStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    maxVideoSizeBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    maxImageSizeBytes: 500 * 1024 * 1024, // 500 MB
    maxAudioSizeBytes: 500 * 1024 * 1024, // 500 MB
    maxDocSizeBytes: 500 * 1024 * 1024, // 500 MB
    allowedCovers: ['brown', 'green', 'navy', 'burgundy', 'black', 'gold'],
    hasWatermark: false,
    hasVoiceDictation: true,
    hasAiTools: true,
    hasCustomThemes: true,
    priorityEncryption: true,
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate Sovereign',
    tagline: 'Completely Unlimited · No Limits · Infinity',
    badge: '⚡ Ultimate',
    maxBooks: 999999999, // Completely Unlimited (∞)
    maxPagesPerBook: 999999999, // Completely Unlimited (∞)
    maxTotalStorageBytes: 999999999999999, // Completely Unlimited (∞)
    maxVideoSizeBytes: 999999999999999, // Completely Unlimited (∞)
    maxImageSizeBytes: 999999999999999, // Completely Unlimited (∞)
    maxAudioSizeBytes: 999999999999999, // Completely Unlimited (∞)
    maxDocSizeBytes: 999999999999999, // Completely Unlimited (∞)
    allowedCovers: ['brown', 'green', 'navy', 'burgundy', 'black', 'gold', 'dragon', 'vellum', 'celestial', '*'],
    hasWatermark: false,
    hasVoiceDictation: true,
    hasAiTools: true,
    hasCustomThemes: true,
    priorityEncryption: true,
    hasGodModeAccess: true,
  },
};

function getTierConfig(tierName) {
  const clean = (tierName || 'classic').toLowerCase().trim();
  if (clean === 'ultimate' || clean === 'infinity' || clean === 'sovereign' || clean === 'unlimited') {
    return TIER_CONFIGS.ultimate;
  }
  if (clean === 'premium' || clean === 'pro' || clean === 'vip' || clean === 'master') {
    return TIER_CONFIGS.premium;
  }
  return TIER_CONFIGS.classic;
}

module.exports = {
  TIER_CONFIGS,
  getTierConfig,
};
