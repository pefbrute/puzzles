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
    drop: (item, monitor) => {
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
