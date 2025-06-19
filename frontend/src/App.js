import './App.css';
import ImageDrop from './Components/ImageDrop';


function App() {
  return (
    <div className="container">
      <h1 className="glow-title"> Image File Converter </h1>
      <p> Drag and drop 1 or more .jpg/.jpeg image files below to upload and convert them to .png</p>

      <ImageDrop />
    </div>
  );
}

export default App;