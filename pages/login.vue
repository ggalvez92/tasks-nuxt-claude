<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const email = ref("");
const password = ref("");
const deviceLabel = ref("");
const isRegistering = ref(false);
const errorMessage = ref("");
const isSubmitting = ref(false);

const { login, register, isLoading } = useAuthService();

const onSubmit = async () => {
  if (isSubmitting.value) return;

  errorMessage.value = "";

  // Validaciones básicas
  if (!email.value || !password.value) {
    errorMessage.value = "Email and password are required";
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters";
    return;
  }

  isSubmitting.value = true;

  try {
    if (isRegistering.value) {
      // Registro
      await register(email.value, password.value);
      errorMessage.value = "";
      // Después del registro, hacer login automático
      await login(email.value, password.value, deviceLabel.value || undefined);
      navigateTo("/");
    } else {
      // Login
      await login(email.value, password.value, deviceLabel.value || undefined);
      navigateTo("/");
    }
  } catch (error: any) {
    errorMessage.value = error.message || (isRegistering.value ? "Registration failed" : "Login failed");
  } finally {
    isSubmitting.value = false;
  }
};

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = "";
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">
        {{ isRegistering ? 'Register' : 'Login' }}
      </h1>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div v-if="!isRegistering">
          <label for="deviceLabel" class="block text-sm font-medium text-gray-700 mb-1">
            Device Label (optional)
          </label>
          <input
            id="deviceLabel"
            v-model="deviceLabel"
            type="text"
            placeholder="e.g., Chrome on MacOS"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Help identify this session</p>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || isLoading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ isSubmitting ? 'Processing...' : (isRegistering ? 'Register' : 'Login') }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button
          @click="toggleMode"
          class="text-blue-600 hover:underline text-sm"
        >
          {{ isRegistering ? 'Already have an account? Login' : "Don't have an account? Register" }}
        </button>
      </div>
    </div>
  </div>
</template>
