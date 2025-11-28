// export default defineEventHandler(async (event) => {
//   return 'Hello Nitro'
// })

// server/api/whoami.get.ts
import { getToken } from "#auth";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default defineEventHandler(async (event) => {
  const token = await getToken({ event });
  console.log("token", token);
  const accessToken = (token as any)?.accessToken;
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: "Missing token" });
  }

  await sleep(3000);

  // Ejemplo: llamar a un recurso protegido con Bearer
  // (reemplaza por tu API real)
  // const external = await $fetch("https://httpbin.org/bearer", {
  //   headers: { Authorization: `Bearer ${accessToken}` },
  // });

  return { accessToken, token };
});
