/**
 * Platform Publishers Index
 * 
 * Central export point for all platform publishers
 */

import youtubePublisher from './youtube.publisher.js';
import instagramPublisher from './instagram.publisher.js';
import tiktokPublisher from './tiktok.publisher.js';
import twitterPublisher from './twitter.publisher.js';

export {
  youtubePublisher,
  instagramPublisher,
  tiktokPublisher,
  twitterPublisher
};

export default {
  youtube: youtubePublisher,
  instagram: instagramPublisher,
  tiktok: tiktokPublisher,
  twitter: twitterPublisher
};
