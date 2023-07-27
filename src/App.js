import React, { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import PuzzleBoard from './PuzzleBoard';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [pieces, setPieces] = useState([]);

  const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post("http://localhost:3001/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    const piecesWithPositions = response.data.map((piece, index) => {
      return {
        id: uuidv4(),
        url: piece,
        index: index, 
      };
    });

    setPieces(piecesWithPositions);
  };
  
  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    const reorderedPieces = Array.from(pieces);
    const [removed] = reorderedPieces.splice(result.source.index, 1);
    reorderedPieces.splice(result.destination.index, 0, removed);

    setPieces(reorderedPieces);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <ImageUpload onUpload={uploadImage} />
        {pieces.length > 0 && <PuzzleBoard pieces={pieces} setPieces={setPieces}/>}
      </div>
    </DndProvider>
  );
}

export default App;
