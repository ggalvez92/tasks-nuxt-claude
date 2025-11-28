<template>
  <div
    class="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
  >
    <!-- Status Checkbox -->
    <button
      @click="toggleStatus"
      :class="
        cn(
          'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
          statusStyles[task.status]
        )
      "
    >
      <Check v-if="task.status === 'COMPLETADA'" class="h-3 w-3 text-white" />
      <Loader
        v-else-if="task.status === 'EN_PROGRESO'"
        class="h-3 w-3 animate-spin text-white"
      />
    </button>

    <!-- Task Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h4
          :class="
            cn(
              'font-medium',
              task.status === 'COMPLETADA' &&
                'line-through text-muted-foreground'
            )
          "
        >
          {{ task.title }}
        </h4>
        <Badge :variant="priorityVariants[task.priority]" class="text-xs">
          {{ priorityLabels[task.priority] }}
        </Badge>
      </div>

      <p v-if="task.description" class="text-sm text-muted-foreground mb-2">
        {{ task.description }}
      </p>

      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <FolderOpen class="h-3 w-3" />
          <span>{{ getCategoryName(task.categoryId) }}</span>
        </div>

        <div v-if="task.dueDate" class="flex items-center gap-1">
          <Clock class="h-3 w-3" />
          <span>{{ formatTime(task.dueDate) }}</span>
        </div>

        <div v-if="task.estimatedTime" class="flex items-center gap-1">
          <Timer class="h-3 w-3" />
          <span>{{ task.estimatedTime }}min</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags?.length" class="flex flex-wrap gap-1 mt-2">
        <Badge
          v-for="tag in task.tags"
          :key="tag"
          variant="outline"
          class="text-xs"
        >
          {{ tag }}
        </Badge>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <Button variant="ghost" size="sm" @click="$emit('edit', task)">
        <Edit class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        @click="$emit('delete', task.id)"
        class="text-destructive hover:text-destructive"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Loader,
  FolderOpen,
  Clock,
  Timer,
  Edit,
  Trash2,
} from "lucide-vue-next";
import { cn } from "~/shared/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Task, TaskStatus, TaskPriority } from "~/shared/types";

interface Props {
  task: Task;
}

interface Emits {
  (e: "updateStatus", id: string, status: TaskStatus): void;
  (e: "update", id: string, updates: Partial<Task>): void;
  (e: "delete", id: string): void;
  (e: "edit", task: Task): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const categoriesStore = useCategoriesStore();

// Computed para evitar recalcular en cada render
const categoryName = computed(() => {
  const category = categoriesStore.getCategoryById(props.task.categoryId);
  return category?.name || "Sin categoría";
});

const statusStyles: Record<TaskStatus, string> = {
  PENDIENTE: "border-gray-300 hover:bg-gray-100",
  EN_PROGRESO: "border-blue-500 bg-blue-500",
  COMPLETADA: "border-green-500 bg-green-500",
  CANCELADA: "border-red-500 bg-red-500",
};

const priorityVariants: Record<
  TaskPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  BAJA: "secondary",
  MEDIA: "outline",
  ALTA: "default",
  URGENTE: "destructive",
};

const priorityLabels: Record<TaskPriority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

function toggleStatus() {
  const task = props.task;
  let newStatus: TaskStatus;

  switch (task.status) {
    case "PENDIENTE":
      newStatus = "EN_PROGRESO";
      break;
    case "EN_PROGRESO":
      newStatus = "COMPLETADA";
      break;
    case "COMPLETADA":
      newStatus = "PENDIENTE";
      break;
    default:
      newStatus = "PENDIENTE";
  }

  emit("updateStatus", task.id, newStatus);
}

function getCategoryName(categoryId: string): string {
  const category = categoriesStore.getCategoryById(categoryId);
  return category?.name || "Sin categoría";
}

function formatTime(date: Date): string {
  return format(date, "HH:mm", { locale: es });
}

</script>
