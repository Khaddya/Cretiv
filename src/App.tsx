import "./App.css";
import { Bold, Italic, Underline, User, User2 } from "lucide-react";
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
import { AddNewItem } from "./components/AddNewItem";
import { Rnd } from "react-rnd";
import { SketchPicker, ColorResult, RGBColor } from "react-color";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { Toggle } from "./components/ui/toggle";
import { Label } from "./components/ui/label";
import DND from "./DND";
import { arrayMove } from "@dnd-kit/sortable";
import LoadingOverlay from "react-loading-overlay-ts";
interface ParsedData {
  [key: string]: string;
}

interface MetaDetails {
  Name: string;
  IsItalic: boolean;
  IsBold: boolean;
  Color: RGBColor;
  Size: number;
}

interface VarImageBoxes {
  MetaDetails: {
    Size: {
      Width: number;
      Height: number;
    };
  };
  ImageLink: string[];
  Location: {
    X: number;
    Y: number;
  };
}

interface VarContentData {
  MetaDetails: MetaDetails;
  VarContent: string[];
  Location: { X: number; Y: number };
}

interface sendTextBoxes {
  VarTextBoxes: VarContentData[];
  VarImageBoxes: VarImageBoxes[];
}

interface DraggableResizableDivProps {
  isImage: boolean;
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onUpdate: (
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  onClick: () => void;
  fontFamily: string;
  name: string;
  fontColor: RGBColor;
  isSelected: boolean;
  isBold: boolean;
  isItalic: boolean;
}

interface Item {
  name: string;
  id: number;
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
  isBold: boolean;
  isItalic: boolean;
  isImage: boolean;
}

interface Item {
  name: string;
  id: number;
}

interface conversionRate {
  x: number;
  y: number;
}

const DraggableResizableDiv: React.FC<DraggableResizableDivProps> = ({
  id,
  position,
  size,
  onUpdate,
  fontFamily,
  name,
  fontColor,
  onClick,
  isSelected,
  isBold,
  isItalic,
  isImage,
}) => {
  const fontSize = Math.min(size.width, size.height) * 0.7;

  return (
    <Rnd
      className={`bg-slate-400 opacity-50 border-2 border-darkblue flex justify-start items-start cursor-move ${
        isSelected ? "active" : ""
      } `}
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
          justifyContent: `${isImage ? "center" : "start"}`,
          alignItems: `${isImage ? "center" : "start"}`,
          width: "100%",
          height: "100%",
          textAlign: "start",
          fontFamily: fontFamily,
          color: `rgba(${fontColor.r}, ${fontColor.g}, ${fontColor.b}, ${255})`,
          fontWeight: isBold ? "900" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          opacity: 1,
          zIndex: 10,
        }}
        onClick={onClick}
      >
        {isImage ? <User2 size={fontSize} /> : name}
      </div>
    </Rnd>
  );
};

function App() {
  const [varContent, setVarContent] = useState<sendTextBoxes>({
    VarTextBoxes: [],
    VarImageBoxes: [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);
  const [divs, setDivs] = useState<DivData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDiv, setSelectedDiv] = useState<DivData | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [aspectRatio, setAspectRatio] = useState(1);
  const [pixelCR, setPixelCR] = useState({ x: 1, y: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const baseURL ="http://localhost:8080"
  // const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setOtp(e.target.value);
  // };

  const [items, setItems] = useState<Item[]>([]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  const SendOTP = () => {
    fetch(baseURL+"/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  const UpdateTextbox = () => {
    const textBoxes = divs
      .filter((div) => div.active && div.isImage === false)
      .map((div) => {
        return {
          MetaDetails: {
            Name: div.fontFamily,
            IsItalic: false,
            IsBold: false,
            Color: div.fontColor,
            Size: Math.round(
              Math.min(
                div.size.width * pixelCR.x,
                div.size.height * pixelCR.y
              ) * 0.7
            ),
          },
          VarContent: div.info, // Assuming content is header, modify as needed
          Location: {
            X: Math.round(div.position.x * pixelCR.x),
            Y: Math.round(div.position.y * pixelCR.y),
          },
        };
      });

    const imageBoxes = divs
      .filter((div) => div.active && div.isImage === true)
      .map((div) => {
        return {
          MetaDetails: {
            Size: {
              Width: Math.round(div.size.width * pixelCR.x),
              Height: Math.round(div.size.height * pixelCR.y),
            },
          },
          ImageLink: div.info, // Assuming info is the image URL, modify as needed
          Location: {
            X: Math.round(div.position.x * pixelCR.x),
            Y: Math.round(div.position.y * pixelCR.y),
          },
        };
      });

    const updatedData: sendTextBoxes = {
      VarTextBoxes: textBoxes,
      VarImageBoxes: imageBoxes,
    };

    setVarContent(updatedData);
  };

  const SendTextBoxRequest = async () => {
    let req = JSON.stringify(varContent);
    console.log("Before sending", req);
    const response = await fetch(baseURL+"/sendTextBoxes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: req,
    });

    const data = await response.text();
    console.log("Response:", data);
  };

  const SendPhoneNumbers = async () => {
    const response = await fetch(baseURL+"/initAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: Array.from(new Set(phoneNumbers)),
        phone: "+91" + phone,
      }),
    });
    const data = await response.json();
    console.log(data);
  };

  // Function to handle file change
  const handleImgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Create an object URL to preview the image
      const fileUrl = URL.createObjectURL(file);

      // Load the image to get its dimensions
      const img = new Image();
      img.src = fileUrl;
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        console.log("Width :", width, " Height :", height);

        // Calculate and set the aspect ratio
        const aspectRatio = width / height;
        setAspectRatio(aspectRatio);
        setPixelCR({ x: width / 500, y: (height * aspectRatio) / 500 });
      };

      if (parentRef.current) {
        parentRef.current.style.backgroundImage = `url(${fileUrl})`;
        parentRef.current.style.aspectRatio = `${aspectRatio}`;
      } else {
        console.log("Parent ref not available");
      }
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
    UpdateTextbox();
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
    setIsLoading(true);
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    const formdata = new FormData();
    formdata.append("image", selectedFile);
    console.log("Hi man");
    fetch(baseURL+"/ping")
      .then((res) => res.text())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
    fetch(baseURL+"/uploadImage", {
      method: "POST",
      body: formdata,
    })
      .then((response) => response.text())
      .then((result) => console.log(result))
      .then(() => SendTextBoxRequest())
      .then(() => {SendPhoneNumbers();setIsLoading(false)})
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (data.length) {
      console.log(data);

      console.log("CLICKED AGAGAGAA");
      const keys = Object.keys(data[0]);
      ClickSubmit(keys, data);
      let itemsArray: Item[] = [];
      keys.forEach((key) => {
        if (key.toLowerCase().includes("img")) {
          data.forEach((row) => {
            const imgValue = row[key];
            itemsArray.push({ name: imgValue, id: Math.random() * 1000 });
          });
        }
      });
      console.log("Items Array", itemsArray);
      itemsArray.pop();

      setItems(itemsArray);
    }
  }, [data]);

  useEffect(() => {
    if (phoneNumbers.length) {
      console.log("Extracted Phone Numbers:", phoneNumbers);
      // You can also display these numbers in your UI
    }
  }, [phoneNumbers]);

  useEffect(() => {
    if (varContent) {
      console.log("VarContent", varContent);
    }
  }, [varContent]);

  const ClickSubmit = (keys: string[], data: ParsedData[]) => {
    const phoneHeaders = ["contact", "phone", "mobile", "tel"]; // Add variations here

    const extractedPhoneNumbers: string[] = [];

    setDivs((prevDivs) => [
      ...prevDivs,
      ...keys.map((key) => {
        const info = data.map((d) => d[key]);

        // Check if the key matches any phone header variation
        const isPhoneHeader = phoneHeaders.some((header) =>
          key.toLowerCase().includes(header)
        );

        // If it's a phone header, extract numbers
        if (isPhoneHeader) {
          extractedPhoneNumbers.push(...info);
        }

        if (key.toLowerCase().includes("img")) {
          return {
            id: key,
            position: { x: 0, y: 0 },
            header: key,
            size: { width: 150, height: 50 },
            active: true,
            fontFamily: "Roboto",
            fontColor: { r: 0, g: 0, b: 0, a: 255 },
            info: info,
            isBold: false,
            isItalic: false,
            isImage: true,
          };
        }

        return {
          id: key,
          position: { x: 0, y: 0 },
          header: key,
          size: { width: 150, height: 50 },
          active: true,
          fontFamily: "Roboto",
          fontColor: { r: 0, g: 0, b: 0, a: 255 },
          info: info,
          isBold: false,
          isItalic: false,
          isImage: false,
        };
      }),
    ]);

    // Update the state with extracted phone numbers
    setPhoneNumbers(extractedPhoneNumbers);
    UpdateTextbox();
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
        div.id === id ? { ...div, fontColor: { ...color.rgb, a: 255 } } : div
      )
    );

    UpdateTextbox();
  };
  const handleBoldChange = (id: string | undefined) => {
    if (id) {
      console.log("Hello");

      setDivs(
        divs.map((div) =>
          div.id === id ? { ...div, isBold: !div.isBold } : div
        )
      );
    }
  };
  const handleItalicChange = (id: string | undefined) => {
    if (id)
      setDivs(
        divs.map((div) =>
          div.id === id ? { ...div, isItalic: !div.isItalic } : div
        )
      );
  };

  return (
    <>
      <nav className="h-[70px] w-full"></nav>
      <div className="w-full bg-white   flex">
        <div className="flex w-screen bg-slate-100 h-screen">
          <div className="relative bg-slate-100 flex flex-1 flex-col items-center   ">
            <div className="absolute top-2 z-10   px-3 py-1 flex  rounded-lg justify-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Color</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Color</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {selectedDiv && (
                    <SketchPicker
                      color={selectedDiv.fontColor}
                      onChange={(color) =>
                        handleColorChange(selectedDiv.id, color)
                      }
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Font</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Font name</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={selectedDiv?.fontFamily}>
                    <DropdownMenuRadioItem
                      value="Roboto"
                      onClick={() => {
                        setDivs(
                          divs.map((div) =>
                            div.id === selectedDiv?.id
                              ? { ...div, fontFamily: "Roboto" }
                              : div
                          )
                        );
                      }}
                    >
                      Roboto
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="Poppins"
                      onClick={() => {
                        setDivs(
                          divs.map((div) =>
                            div.id === selectedDiv?.id
                              ? { ...div, fontFamily: "Poppins" }
                              : div
                          )
                        );
                      }}
                    >
                      Poppins
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex justify-between gap-4">
                <Toggle
                  value="bold"
                  onClick={() => {
                    handleBoldChange(selectedDiv?.id);
                  }}
                  aria-label="Toggle bold"
                  className="bg-black text-white border-2 border-white "
                >
                  <Bold className="h-4 w-4 " />
                </Toggle>
                <Toggle
                  value="italic"
                  onClick={() => {
                    handleItalicChange(selectedDiv?.id);
                  }}
                  aria-label="Toggle italic"
                  className="bg-black text-white border-2 border-white "
                >
                  <Italic className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            <div
              className="parent shadow-xl rounded-md mx-auto mt-[4.5rem]"
              ref={parentRef}
            >
              {divs.map((div) => {
                if (div.active) {
                  return (
                    <DraggableResizableDiv
                      isImage={div.isImage}
                      key={div.id}
                      id={div.id}
                      position={div.position}
                      size={div.size}
                      onUpdate={updateDiv}
                      name={div.header}
                      fontFamily={div.fontFamily}
                      fontColor={div.fontColor}
                      onClick={() => {
                        setSelectedDiv(div);
                      }}
                      isSelected={div.id === selectedDiv?.id}
                      isBold={div.isBold}
                      isItalic={div.isItalic}
                    />
                  );
                }

                return null;
              })}
            </div>

            <Table>
              <TableBody>
                <TableRow>
                  {divs.map((div) => (
                    <TableCell key={div.id}>
                      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {div.header + "  "}
                        <Switch
                          defaultChecked={true}
                          onClick={() => {
                            setDivs(
                              divs.map((d) =>
                                d.id === div.id
                                  ? { ...d, active: !d.active }
                                  : d
                              )
                            );
                          }}
                        />
                      </h3>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex-1 relative  flex flex-col items-center  gap-4 px-6">
            <div className="absolute top-2  flex justify-center gap-4  w-[400px] ">
              <Input
                type="file"
                accept=".csv"
                className="m-2 size-min shadow-sm border border-black"
                onChange={handleFileChange}
              />
              <Button onClick={handleSubmit}>Upload</Button>
            </div>
            <div className="rounded-md shadow-xl h-[400px] bg-white w-full mt-16  p-4 flex">
              {data.length > 0 && (
                <div className="overflow-y-scroll">
                  <div className="flex ">
                    {" "}
                    <Table>
                      <TableHeader className="">
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
                          <TableRow key={index} className="h-[60px]">
                            {Object.values(row).map((val, i) => (
                              <TableCell key={i}>{val}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {items.length > 0 && (
                      <DND
                        items={items}
                        key={1}
                        handleDragEnd={handleDragEnd}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className=" bottom-10 z-10 bg-white p-4   rounded-lg ">
              <div>
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Poster Panel
                </h2>
                <input type="file" onChange={handleImgFileChange} />
              </div>
              {/* <button
          onClick={UpdateTextbox}
          className="bordder bg-black rounded-md text-white font-semibold mt-2 p-2"
        >
          Log Data
        </button> */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Phonenumber</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Phone Number </DialogTitle>
                    <DialogDescription>
                      Make changes to your phone number here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <InputOTP
                        maxLength={10}
                        value={phone}
                        onChange={(val) => setPhone(val)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={6} />
                          <InputOTPSlot index={7} />
                          <InputOTPSlot index={8} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={9} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose>
                      <Button type="submit" onClick={() => console.log(phone)}>
                        Save changes
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger>
                  <button
                    onClick={handleFinalSubmit}
                    className="bordder bg-black rounded-md text-white font-semibold mt-2 p-2 ml-2"
                  >
                    Upload
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="h-[10rem] grid place-content-center">
                    <DialogTitle>Check your telegram for OTP </DialogTitle>
                    <DialogDescription className="">
                    {isLoading ? (
                   <LoadingOverlay
                   active={true}
                   styles={{
                    height : "full",
                     spinner: (base:any) => ({
                       ...base,
                       width: '50px',
                       '& svg circle': {
                         stroke: 'rgba(0, 0, 0, 1)'
                       }
                     })
                   }}
                 >
   
                 </LoadingOverlay>
                  ) :"We have sent you OTP on your Telegram App. Enter it here for sharing the posters."}
                    </DialogDescription>
                  </DialogHeader>
                   {!isLoading?(
                    <InputOTP
                      maxLength={5}
                      value={otp}
                      onChange={(value) => {
                        console.log(otp);
                        setOtp(value);
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                    </InputOTP>
                  ):""}

                  <DialogClose>
                    {!isLoading?<Button
                      onClick={() => {
                        SendOTP();
                      }}
                      className="otp-submit-button"
                    >
                      Submit
                    </Button>:""}
                    
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
