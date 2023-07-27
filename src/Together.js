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


import React from "react";
import PuzzlePiece from "./PuzzlePiece";

const style = {
  display: "flex",
  flexWrap: "wrap"
};

const PuzzleBoard = ({ pieces, setPieces }) => {
  const rows = [...Array(5)];  // assuming 5 rows

  return (
    <div style={style}>
      {rows.map((_, rowIndex) => (
        <div key={rowIndex}>
          {pieces.slice(rowIndex * 10, (rowIndex + 1) * 10).map((piece, index) => (
            <PuzzlePiece
              key={piece.id}
              id={piece.id}
              piece={piece}
              index={rowIndex * 10 + index}
              pieces={pieces}
              setPieces={setPieces}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PuzzleBoard;



import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const PuzzlePiece = ({ id, piece, index, pieces, setPieces }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'piece',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: 'piece',
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const draggingPiece = pieces.find(p => p.id === item.id);
      
      const newPieces = [...pieces];
      newPieces.splice(dragIndex, 1);
      newPieces.splice(hoverIndex, 0, draggingPiece);

      setPieces(newPieces);

      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      style={{
        opacity: isDragging ? 0 : 1,
        width: 80,
        height: 80,
        backgroundImage: `url(${piece.url})`,
        backgroundSize: 'cover',
        margin: 2
      }}
    />
  );
};

export default PuzzlePiece;


// ImageUpload.js
import React from 'react';

function ImageUpload({ onUpload }) {
  const handleImageChange = event => {
    if (event.target.files && event.target.files[0]) {
      onUpload(event.target.files[0]);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
    </div>
  );
}

export default ImageUpload;


// server.js
const express = require('express');
const multer  = require('multer');
const sharp = require('sharp');
const upload = multer({ dest: 'uploads/' })
const cors = require('cors');

const app = express();
app.use('/uploads', express.static('uploads'))

app.use(cors());


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = await sharp(req.file.path);
    const { width, height } = await image.metadata();

    const promises = [];
    const pieceWidth = Math.round(width / 10);
    const pieceHeight = Math.round(height / 5);


    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 10; j++) {
        let extractWidth = pieceWidth;
        let extractHeight = pieceHeight;

        // Если это последний фрагмент по горизонтали
        if (j === 9) {
          extractWidth = width - pieceWidth * j;
        }

        // Если это последний фрагмент по вертикали
        if (i === 4) {
          extractHeight = height - pieceHeight * i;
        }

        promises.push(
          image
            .clone()
            .extract({
              left: pieceWidth * j,
              top: pieceHeight * i,
              width: extractWidth,
              height: extractHeight,
            })
            .toFile(`uploads/${i}-${j}.png`)
        );
      }
    }

    await Promise.all(promises);

    const imagePieces = [];
 
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 10; j++) {
        imagePieces.push(`/uploads/${i}-${j}.png`);
      }
    }

    shuffleArray(imagePieces); // перемешивание массива

    res.json(imagePieces.map(piece => `http://localhost:3001${piece}`));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});


