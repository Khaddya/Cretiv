import { FC } from "react";
import { Card } from "../components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Item {
  id: number;
  name: string;
}

interface SortableLinkCardProps {
  id: Item;
}

const SortableLinks: FC<SortableLinkCardProps> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mt-1">
      <Card className="py-2 px-2 mb-4 relative flex justify-between gap-5 group border-none shadow-none border-b-2">
        <div>{id.name}</div>
        <div className="flex justify-center items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab"
            aria-describedby={`DndContext-${id.id}`}
          >
            <svg viewBox="0 0 20 20" width="15">
              <path
                d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SortableLinks;
