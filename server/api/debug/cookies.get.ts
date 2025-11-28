/**
 * Debug endpoint para ver qué cookies están disponibles
 */

export default defineEventHandler((event) => {
  const cookies = parseCookies(event);

  return {
    cookies,
    hasAccessToken: !!cookies.accessToken,
    hasRefreshToken: !!cookies.refreshToken,
    accessTokenValue: cookies.accessToken ? '***' + cookies.accessToken.slice(-10) : null,
    allCookieNames: Object.keys(cookies)
  };
});
