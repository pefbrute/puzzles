import React from "react";
import PuzzlePiece from "./PuzzlePiece";

const style = {
  display: "flex",
  flexWrap: "wrap"
};

const PuzzleBoard = ({ pieces, setPieces }) => {
  const rows = [...Array(5)];

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

