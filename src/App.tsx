import "./App.css";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { ChangeEvent, useState } from "react";
import Papa from "papaparse";

interface ParsedData {
  [key: string]: string;
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

  return (
    <div className=" w-full   bg-white h-screen p-4">
      <div className="grid grid-cols-2 w-full h-[729px] bg-black ">
        <div className="col-span-1 bg-blue-600"></div>
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
