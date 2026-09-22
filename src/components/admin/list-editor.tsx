import type { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

export type WithId = { _id: string };

export const withIds = <T,>(items: T[]): (T & WithId)[] =>
  items.map((i) => ({ ...i, _id: crypto.randomUUID() }));

export const stripIds = <T extends WithId>(items: T[]) =>
  items.map(({ _id, ...rest }) => rest as Omit<T, "_id">);

function Row({
  id,
  onRemove,
  children,
}: {
  id: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="border border-[var(--line)] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="cursor-grab select-none text-[13px] text-[color:var(--muted-foreground)] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Réordonner"
        >
          ⠿ glisser
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="nav-caps hover-red text-[11px]"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function ListEditor<T extends WithId>({
  items,
  onChange,
  create,
  addLabel = "+ Ajouter",
  children,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  create: () => T;
  addLabel?: string;
  children: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item, index) => (
              <Row
                key={item._id}
                id={item._id}
                onRemove={() => onChange(items.filter((_, j) => j !== index))}
              >
                {children(item, (patch) =>
                  onChange(
                    items.map((it, j) => (j === index ? { ...it, ...patch } : it)),
                  ),
                )}
              </Row>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" onClick={() => onChange([...items, create()])}>
        {addLabel}
      </Button>
    </div>
  );
}
