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

    shuffleArray(imagePieces);

    res.json(imagePieces.map(piece => `http://localhost:3001${piece}`));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
