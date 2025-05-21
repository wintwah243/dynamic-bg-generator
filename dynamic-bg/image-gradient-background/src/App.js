import React, { useRef, useState } from "react";
import ColorThief from "color-thief-browser";
import "./App.css";

function App() {
  const imgRef = useRef(null); //dom element img tag အတွက်
  const [gradient, setGradient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [palette, setPalette] = useState([]);
  const [colorType, setColorType] = useState("gradient"); 

  // user က input tagမှာimage uploadလုပ်လိုက်ရင် handleဖို့အတွက်
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; //user uploadလိုက်တဲ့fileကိုယူပြီး variableထဲသိမ်းမယ်
    if (!file) return; //user img fileကို selectမလုပ်ဘူးဆိုရင် functionပြီးသွားမယ်

    setIsLoading(true);
    const imageURL = URL.createObjectURL(file); // temporary URL တစ်ခုေဆာက်မယ်
    //Image() ဆိုတာက built-in JavaScript browser API တစ်ခုဖြစ်တယ်
    const img = new Image(); //image obj တစ်ခု createလုပ်မယ်
    img.crossOrigin = "Anonymous"; //image processingလုပ်ဖို့အတွက်ဒါကလိုတယ်
    img.src = imageURL;

    //image ရပြီဆိုတာနဲ့ ဒီfunction runမယ်
    img.onload = async () => {
      try {
        //color thief က image ရဲ့ color ေတွက်ို extractလုပ်ပေးဖို့
        const colorThief = new ColorThief(); // ColorThief library ရဲ့ instance တစ်ခုေဆာက်

        // Asks ColorThief to get the top 5 colors from the image
        const colors = await colorThief.getPalette(img, 5);
        
        // Convert RGB arrays to hex strings
        const hexPalette = colors.map(color => rgbToHex(color));
        setPalette(hexPalette); // UI မှာdisplay ပြနိုင်ဖို့
        
        // Create gradient using the two most distinct colors
        const sortedBySaturation = [...colors].sort((a, b) => {
          const satA = getSaturation(a);
          const satB = getSaturation(b);
          return satB - satA; // vivid ြဖစ်တဲ့ color ကိုေရွးပြီး new arrayတစ်ခုေဆာက်
        });
        
        const gradientColors = sortedBySaturation.slice(0, 2);  // Take the two most vivid colors for gradient
        //Builds a CSS gradient string using those two colors
        const gradientCSS = `linear-gradient(135deg, 
          rgb(${gradientColors[0].join(',')}) 0%, 
          rgb(${gradientColors[1].join(',')}) 100%)`;
        
        setGradient(gradientCSS); //background displayပြဖို့
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        setIsLoading(false);
      }
    };

    imgRef.current.src = imageURL;
  };

  // Helper function to calculate color saturation
  const getSaturation = (rgb) => {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return (max - min) / max || 0;
  };

  // Convert RGB array to hex string
  const rgbToHex = (rgb) => {
    return `#${rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    }).join('')}`;
  };

  return (
    <div className="app-container" style={{ background: gradient || "#f8f9fa" }}>
      <div className="content-card">
        <h1 className="app-title">Color Palette Generator</h1>
        <p className="app-description">
          Upload an image to extract its color palette and generate beautiful gradients.
        </p>
        
        <label className="file-upload-button">
          {isLoading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
              Processing
            </div>
          ) : (
            ""
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="file-input"
            disabled={isLoading}
          />
        </label>
        
        {palette.length > 0 && (
          <div className="color-results">
            <div className="view-options">
              <button 
                className={`view-option ${colorType === 'gradient' ? 'active' : ''}`}
                onClick={() => setColorType('gradient')}
              >
                Gradient View
              </button>
              <button 
                className={`view-option ${colorType === 'palette' ? 'active' : ''}`}
                onClick={() => setColorType('palette')}
              >
                Palette View
              </button>
            </div>
            
            {colorType === 'gradient' ? (
              <div 
                className="gradient-preview"
                style={{ background: gradient }}
              ></div>
            ) : (
              <div className="color-palette">
                {palette.map((color, index) => (
                  <div 
                    key={index} 
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => navigator.clipboard.writeText(color)}
                  >
                    <span className="color-value">{color}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <img ref={imgRef} alt="Uploaded Preview" style={{ display: "none" }} />
      </div>
    </div>
  );
}

export default App;
