import "./App.css";
import { Input } from "./components/ui/input";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/components/ui/table";

import { Rnd } from "react-rnd";
import { SketchPicker, ColorResult, RGBColor } from "react-color";

interface ParsedData {
  [key: string]: string;
}

interface MetaDetails {
  Name: string;
  IsItalic: string;
  IsBold: string;
  Color: RGBColor;
  Size: number;
}

interface VarContentData {
  Metadetails: MetaDetails;
  VarContent: string[];
  Location: { X: number; Y: number };
}

interface VarContentProps {
  data: VarContentData;
}

interface DraggableResizableDivProps {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onUpdate: (
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  fontFamily: string;
  name: string;
  fontColor: RGBColor;
}

interface DivData {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  header: string;
  active: boolean;
  fontFamily: string;
  fontColor: RGBColor;
  info: string[];
}

const DraggableResizableDiv: React.FC<DraggableResizableDivProps> = ({
  id,
  position,
  size,
  onUpdate,
  fontFamily,
  name,
  fontColor,
}) => {
  const fontSize = Math.min(size.width, size.height) * 0.3;

  return (
    <Rnd
      className="bg-slate-400 opacity-50 border-2 border-darkblue flex justify-start items-start cursor-move"
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(_: any, d: any) => onUpdate(id, { x: d.x, y: d.y }, size)}
      onResizeStop={(_, __, ref, ___, newPosition) => {
        onUpdate(id, newPosition, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
      }}
      bounds="parent"
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: "normal",
          overflow: "hidden",
          wordWrap: "break-word",
          display: "flex",
          justifyContent: "start",
          alignItems: "start",
          width: "100%",
          height: "100%",
          textAlign: "start",
          fontFamily: fontFamily,
          color: `rgba(${fontColor.r}, ${fontColor.g}, ${fontColor.b}, ${fontColor.a})`,
        }}
      >
        {name}
      </div>
    </Rnd>
  );
};

function App() {
  const [varContent, setVarContent] = useState<VarContentProps[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);
  const [divs, setDivs] = useState<DivData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDataRequest = async () => {
    const updatedData = divs.map((div) => ({
      data: {
        Metadetails: {
          Name: div.header,
          IsItalic: "false",
          IsBold: "false",
          Color: div.fontColor,
          Size: Math.min(div.size.width, div.size.height) * 0.3,
        },
        VarContent: div.info, // Assuming content is header, modify as needed
        Location: {
          X: div.position.x,
          Y: div.position.y,
        },
      },
    }));

    setVarContent(updatedData);
  };

  const handleImgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const updateDiv = (
    id: string,
    newPosition: { x: number; y: number },
    newSize: { width: number; height: number }
  ) => {
    setDivs(
      divs.map((div) =>
        div.id === id ? { ...div, position: newPosition, size: newSize } : div
      )
    );
  };

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

  const handleFinalSubmit = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    const formdata = new FormData();
    formdata.append("image", selectedFile);
    console.log("Hi man");

    fetch("https://photo-content-generator.onrender.com/uploadImage", {
      method: "POST",
      body: formdata,
      redirect: "follow",
      mode: "no-cors",
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (data.length) {
      const keys = Object.keys(data[0]);
      ClickSubmit(keys, data);
    }
  }, [data]);

  useEffect(() => {
    if (varContent.length) {
      console.log(varContent);
    }
  }, [varContent]);

  const ClickSubmit = (keys: string[], data: ParsedData[]) => {
    setDivs((prevDivs) => [
      ...prevDivs,
      ...keys.map((key) => ({
        id: key,
        position: { x: 0, y: 0 },
        header: key,
        size: { width: 80, height: 50 },
        active: true,
        fontFamily: "Roboto",
        fontColor: { r: 0, g: 0, b: 0, a: 1 },
        info: data.map((d) => d[key]),
      })),
    ]);
  };

  useEffect(() => {
    if (divs.length) {
      console.log(divs);
    }
  }, [divs]);

  const parentRef = useRef<HTMLDivElement>(null);
  const handleColorChange = (id: string, color: ColorResult) => {
    setDivs(
      divs.map((div) =>
        div.id === id ? { ...div, fontColor: color.rgb } : div
      )
    );
  };

  return (
    <div className="w-full bg-white h-screen p-4 ">
      <div className="flex w-full bg-black">
        <div className="flex-1 bg-blue-600 ">
          <div>
            <div>
              <input type="file" onChange={handleImgFileChange} />
              <button onClick={handleFinalSubmit}>Upload</button>
            </div>
            <div onClick={handleDataRequest}>SEND DATA REQUEST</div>
          </div>
          <div className="parent" ref={parentRef}>
            {divs.map((div) => {
              if (div.active) {
                return (
                  <DraggableResizableDiv
                    key={div.id}
                    id={div.id}
                    position={div.position}
                    size={div.size}
                    onUpdate={updateDiv}
                    name={div.header}
                    fontFamily={div.fontFamily}
                    fontColor={div.fontColor}
                  />
                );
              }
              return null;
            })}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {divs.map((div) => (
                  <TableHead key={div.header}>{div.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {divs.map((div) => (
                  <TableCell key={div.id}>
                    <button
                      onClick={() => {
                        setDivs(
                          divs.map((d) =>
                            d.id === div.id ? { ...d, active: !d.active } : d
                          )
                        );
                      }}
                    >
                      {String(!div.active)}
                    </button>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {divs.map((div) => (
                  <TableCell key={div.id} className="">
                    <button
                      className="mr-2 border-2 border-darkblue"
                      onClick={() => {
                        setDivs(
                          divs.map((d) =>
                            d.id === div.id ? { ...d, fontFamily: "Roboto" } : d
                          )
                        );
                      }}
                    >
                      Rob
                    </button>
                    <button
                      className="mr-2 border-2 border-darkblue"
                      onClick={() => {
                        setDivs(
                          divs.map((d) =>
                            d.id === div.id
                              ? { ...d, fontFamily: "Poppins" }
                              : d
                          )
                        );
                      }}
                    >
                      Poppins
                    </button>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {divs.map((div) => (
                  <TableCell key={div.id}>
                    <SketchPicker
                      color={div.fontColor}
                      onChange={(color) => handleColorChange(div.id, color)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex-1 bg-red-500">
          <div className="flex justify-center gap-4 bg-slate-500 py-4">
            <Input
              type="file"
              accept=".csv"
              className="m-2 size-min"
              onChange={handleFileChange}
            />
            <button onClick={handleSubmit}>Upload</button>
          </div>
          <div className="bg-white h-[100vh] overflow-y-scroll p-4">
            {data.length > 0 && (
              <Table>
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
