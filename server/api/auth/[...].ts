// server/api/auth/[...].ts
import { NuxtAuthHandler } from "#auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NuxtAuthHandler({
  // Firmado/encriptado del JWT
  secret: useRuntimeConfig().authSecret,

  // Importante: sesiones por JWT (no DB)
  session: { strategy: "jwt" },

  pages: { signIn: "/login" }, // opcional

  providers: [
    // @ts-expect-error: en Vite/SSR se usa .default() con next-auth v4
    CredentialsProvider.default({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        platform: { label: "Platform", type: "text" },
        deviceLabel: { label: "Device Label", type: "text" },
      },
      async authorize(credentials: any, req: any) {
        const email = credentials?.email;
        const password = credentials?.password;
        const platform = credentials?.platform || 'WEB';
        const deviceLabel = credentials?.deviceLabel;

        if (!email || !password) {
          return null;
        }

        try {
          // Llamar al backend real
          const config = useRuntimeConfig();
          const backendUrl = config.public.backendApiUrl || 'http://localhost:5000';

          const response = await $fetch<any>(`${backendUrl}/auth/login`, {
            method: 'POST',
            body: {
              email,
              password,
              platform,
              deviceLabel,
            },
          });

          // Si el login es exitoso, devolvemos el usuario con los tokens
          if (response.user && response.accessToken && response.refreshToken) {
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.email, // nuxt-auth requiere name
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            };
          }

          return null;
        } catch (error: any) {
          console.error('[AuthJS] Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Callback JWT: guardamos información del usuario y tokens
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Guardar los tokens en el JWT
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    // Callback Session: exponemos información del usuario con tokens
    async session({ session, token }) {
      if (token) {
        (session as any).user = {
          id: token.id,
          email: token.email,
        };
        // Incluir los tokens en la sesión para que estén disponibles en el servidor
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },

  // Evento después de login para configurar cookies httpOnly
  events: {
    async signIn({ user, account }) {
      // Las cookies httpOnly se configurarán a través del endpoint proxy
      console.log('[AuthJS] User signed in:', user.email);
    },
  },
});
