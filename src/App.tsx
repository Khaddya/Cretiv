import "./App.css";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { ChangeEvent, useRef, useState, FC } from "react";
import Papa from "papaparse";

import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';

interface ParsedData {
  [key: string]: string;
}

interface Position {
  x: number;
  y: number;
}

interface Positions {
  [key: string]: Position;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileRead = (content: string) => {
    const parsedData = Papa.parse<ParsedData>(content, { header: true });
    setData(parsedData.data);
  };

  const handleSubmit = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === "string") {
          handleFileRead(e.target.result);
        }
      };
      reader.readAsText(file);
    }
  };


  const parentRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Positions>({});

  const handleDragStop = (e: DraggableEvent, data: DraggableData, id: string) => {
    if (parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const childRect = data.node.getBoundingClientRect();
      const x = childRect.left - parentRect.left;
      const y = childRect.top - parentRect.top;

      setPositions((prev) => ({
        ...prev,
        [id]: { x, y }
      }));
      console.log(positions);
    }
  };

  const logPositions = () => {
    console.log(positions);
  };

  return (
    <div className=" w-full   bg-white h-screen p-4">
      <div className="grid grid-cols-2 w-full h-[729px] bg-black ">
        <div className="col-span-1 bg-blue-600">
        

        <div className="parent" ref={parentRef}>
        <Draggable
          bounds="parent"
          onStop={(e, data) => handleDragStop(e, data, 'child1')}
        >
          <div className="child" id="child1">Child 1</div>
        </Draggable>
        <Draggable
          bounds="parent"
          onStop={(e, data) => handleDragStop(e, data, 'child2')}
        >
          <div className="child" id="child2">Child 2</div>
        </Draggable>
        
      </div>
      <button onClick={logPositions}>Log Positions</button>
        
        </div>
        <div className="col-span-1 bg-red-500 grid grid-rows-12">
          <div className=" flex row-span-2 justify-end bg-slate-500">
            <Input type="file" accept=".csv" className=" m-2 size-min"></Input>
          </div>
          <div className="row-span-9 bg-slate-900"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
