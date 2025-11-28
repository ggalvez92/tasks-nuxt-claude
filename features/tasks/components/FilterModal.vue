<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
  >
    <Card class="w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Filtros</h2>
          <Button variant="ghost" size="sm" @click="$emit('close')">
            <X class="h-4 w-4" />
          </Button>
        </div>

        <div class="space-y-6">
          <!-- Status Filter -->
          <div class="space-y-3">
            <label class="text-sm font-medium">Estado</label>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.status"
                  value="PENDIENTE"
                  class="rounded"
                />
                <span class="text-sm">Pendiente</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.status"
                  value="EN_PROGRESO"
                  class="rounded"
                />
                <span class="text-sm">En Progreso</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.status"
                  value="COMPLETADA"
                  class="rounded"
                />
                <span class="text-sm">Completada</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.status"
                  value="CANCELADA"
                  class="rounded"
                />
                <span class="text-sm">Cancelada</span>
              </label>
            </div>
          </div>

          <!-- Priority Filter -->
          <div class="space-y-3">
            <label class="text-sm font-medium">Prioridad</label>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.priority"
                  value="BAJA"
                  class="rounded"
                />
                <span class="text-sm">Baja</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.priority"
                  value="MEDIA"
                  class="rounded"
                />
                <span class="text-sm">Media</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.priority"
                  value="ALTA"
                  class="rounded"
                />
                <span class="text-sm">Alta</span>
              </label>
              <label class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="localFilter.priority"
                  value="URGENTE"
                  class="rounded"
                />
                <span class="text-sm">Urgente</span>
              </label>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="space-y-3">
            <label class="text-sm font-medium">Categoría</label>
            <div class="space-y-2">
              <label
                v-for="category in categories"
                :key="category.id"
                class="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  v-model="localFilter.categoryId"
                  :value="category.id"
                  class="rounded"
                />
                <span class="text-sm">{{ category.name }}</span>
              </label>
            </div>
          </div>

          <!-- Search -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Buscar</label>
            <Input
              v-model="localFilter.search"
              placeholder="Buscar en título y descripción..."
            />
          </div>

          <!-- Date Range -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Rango de fechas</label>
            <div class="grid grid-cols-1 gap-2">
              <Input
                v-model="startDateInput"
                type="date"
                placeholder="Fecha inicio"
              />
              <Input
                v-model="endDateInput"
                type="date"
                placeholder="Fecha fin"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-6">
          <Button variant="outline" @click="clearFilters">
            Limpiar Filtros
          </Button>
          <div class="flex gap-2">
            <Button variant="outline" @click="$emit('close')">
              Cancelar
            </Button>
            <Button @click="applyFilters"> Aplicar Filtros </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { TaskFilter, TaskStatus, TaskPriority } from "~/shared/types";

interface Props {
  currentFilter: TaskFilter;
}

interface Emits {
  (e: "apply", filter: TaskFilter): void;
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const open = defineModel<boolean>("open", { required: true });

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);

const localFilter = reactive<{
  status: TaskStatus[];
  priority: TaskPriority[];
  categoryId: string[];
  search: string;
}>({
  status: [],
  priority: [],
  categoryId: [],
  search: "",
});

const startDateInput = ref("");
const endDateInput = ref("");

// Initialize filter from props
watch(
  () => props.currentFilter,
  (filter) => {
    localFilter.status = [...(filter.status || [])];
    localFilter.priority = [...(filter.priority || [])];
    localFilter.categoryId = [...(filter.categoryId || [])];
    localFilter.search = filter.search || "";

    if (filter.dateRange) {
      startDateInput.value =
        filter?.dateRange.start.toISOString().split("T")[0] ?? "";
      endDateInput.value =
        filter?.dateRange.end.toISOString().split("T")[0] ?? "";
    } else {
      startDateInput.value = "";
      endDateInput.value = "";
    }
  },
  { immediate: true }
);

function applyFilters() {
  const filter: TaskFilter = {
    status: localFilter.status.length > 0 ? localFilter.status : undefined,
    priority:
      localFilter.priority.length > 0 ? localFilter.priority : undefined,
    categoryId:
      localFilter.categoryId.length > 0 ? localFilter.categoryId : undefined,
    search: localFilter.search.trim() || undefined,
    dateRange:
      startDateInput.value && endDateInput.value
        ? {
            start: new Date(startDateInput.value + "T00:00:00"),
            end: new Date(endDateInput.value + "T23:59:59"),
          }
        : undefined,
  };

  emit("apply", filter);
}

function clearFilters() {
  localFilter.status = [];
  localFilter.priority = [];
  localFilter.categoryId = [];
  localFilter.search = "";
  startDateInput.value = "";
  endDateInput.value = "";

  emit("apply", {});
}
</script>
