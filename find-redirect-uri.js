import * as AuthSession from 'expo-auth-session';

// Test all possible redirect URI configurations
console.log('=== EXPO REDIRECT URI DEBUG ===');

// 1. Default makeRedirectUri (what you're currently using)
const defaultRedirect = AuthSession.makeRedirectUri({
    scheme: 'civicai',
    path: 'auth-callback'
});
console.log('1. Current redirect URI:', defaultRedirect);

// 2. With useProxy: true (for Expo Go)
const proxyRedirect = AuthSession.makeRedirectUri({
    useProxy: true
});
console.log('2. Expo Go proxy redirect:', proxyRedirect);

// 3. Platform-specific
const webRedirect = AuthSession.makeRedirectUri({
    scheme: 'civicai',
    path: 'auth-callback',
    preferLocalhost: true
});
console.log('3. Web redirect:', webRedirect);

// 4. No path specified
const simpleRedirect = AuthSession.makeRedirectUri({
    scheme: 'civicai'
});
console.log('4. Simple scheme redirect:', simpleRedirect);

console.log('\n=== INSTRUCTIONS ===');
console.log('Copy the redirect URI that matches your environment and add it to:');
console.log('1. Google Cloud Console → OAuth Client → Authorized redirect URIs');
console.log('2. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs');
