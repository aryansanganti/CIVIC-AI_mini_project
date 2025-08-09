// Debug script to check OAuth redirect URIs
const { makeRedirectUri } = require('expo-auth-session');

console.log('=== DEBUG: OAuth Redirect URIs ===');

// For Android
console.log('Android redirect URI:', makeRedirectUri({
    scheme: 'civicai',
    path: 'auth-callback'
}));

// For iOS
console.log('iOS redirect URI:', makeRedirectUri({
    scheme: 'civicai',
    path: 'auth-callback'
}));

// For web
console.log('Web redirect URI:', makeRedirectUri({
    scheme: 'civicai',
    path: 'auth-callback'
}));

console.log('\n=== App Configuration ===');
console.log('App scheme from app.json:', 'civicai');
console.log('Bundle ID (iOS):', 'com.civicai.app');
console.log('Package name (Android):', 'com.civicai.app');
