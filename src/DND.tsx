import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { FC, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { AddNewItem } from "./components/AddNewItem";
import SortableLinks from "./components/SortableLinks";

interface Item {
  name: string;
  id: number;
}

interface DNDProps {
  items: Item[];

  handleDragEnd: (event: any) => void;
}

const DND: FC<DNDProps> = ({ items, handleDragEnd }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <main className="flex items-start  select-none">
      <Card className="w-full py-1">
        <CardHeader className="">Img</CardHeader>
        <CardContent className="grid p-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <>
                  <SortableLinks key={item.id} id={item} />
                  <hr />
                </>
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </main>
  );
};
export default DND;
