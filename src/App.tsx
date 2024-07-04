import "./App.css";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { ChangeEvent, useRef, useState, FC } from "react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/components/ui/table";

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
    <div className=" w-full bg-white h-screen p-4 overflow-hidden">
      <div className="flex w-full  bg-black ">
        <div className="flex-1 bg-blue-600">

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
        <div className="flex-1 bg-red-500 ">
          <div className=" flex justify-center gap-4 bg-slate-500 py-4">
            <Input
              type="file"
              accept=".csv"
              className=" m-2 size-min"
              onChange={handleFileChange}
            ></Input>
            <button onClick={handleSubmit}>Upload</button>
          </div>
          <div className=" bg-white h-[100vh] overflow-y-scroll p-4">
            {data.length && (
              <Table className="">
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableHead key={key} className="w-[100px]">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((val, i) => (
                        <TableCell key={i}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
