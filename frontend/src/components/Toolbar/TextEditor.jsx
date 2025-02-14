import { LuUndo2, LuRedo2, LuUnderline } from "react-icons/lu";
import { MdFormatQuote } from "react-icons/md";
import { HiOutlineBold } from "react-icons/hi2";
import { FiItalic } from "react-icons/fi";
import { useEffect, useState } from "react";

  const TextEditor = ({ onFormat, onFontChange, onFontSizeChange }) => {
    const [fonts, setFonts] = useState([]);
  
    const fontSizes = ["1", "2", "3", "4", "5", "6", "7"];

    useEffect(() => {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const apiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`;
  
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const fontList = data.items.map((font) => font.family);
          setFonts(fontList);
        })
        .catch((error) => console.error('Error fetching fonts:', error));
    }, []);
  
    return (
      <div className="flex space-x-2 p-2 bg-[#F5F5F2] rounded-lg">
        {/* Font Selection */}
        <select
          onChange={(e) => onFontChange(e.target.value)}
          className="px-2 py-1 bg-white border border-gray-300 outline-none rounded"
        >
          {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
        </select>
  
        {/* Font Size Selection */}
        <select
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="px-2 py-1 bg-white border border-gray-300 outline-none rounded"
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
  
        {/* Bold */}
        <button
          onClick={() => onFormat("bold")}
          title="Bold"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <HiOutlineBold />
        </button>
  
        {/* Italic */}
        <button
          onClick={() => onFormat("italic")}
          title="Italic"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <FiItalic />
        </button>
  
        {/* Underline */}
        <button
          onClick={() => onFormat("underline")}
          title="Underline"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <LuUnderline />
        </button>
  
        {/* Undo */}
        <button
          onClick={() => onFormat("undo")}
          title="Undo"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <LuUndo2 />
        </button>
  
        {/* Redo */}
        <button
          onClick={() => onFormat("redo")}
          title="Redo"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <LuRedo2 />
        </button>
  
        {/* Quotes */}
        <button
          onClick={() => onFormat("formatBlock", "blockquote")}
          title="Quote"
          className="px-2 py-1 bg-white border border-gray-300 rounded"
        >
          <MdFormatQuote />
        </button>
      </div>
    );
  };

  export default TextEditor