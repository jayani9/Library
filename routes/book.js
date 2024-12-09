import express from 'express';
import bookController from './../controllers/bookController.js';
import path from 'path';
import multer from "multer";
import tokenVerify from './../middlewares/tokenVerify.js'

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

const route = express.Router();

route.post('/book', upload.single("file"), tokenVerify, bookController.addNewBook);  // add new book
route.get('/book', tokenVerify, bookController.getBooks); // get All books
route.put('/book/:id',upload.single("file"), tokenVerify, bookController.updateBook); // update book by id
route.delete('/book/:id', tokenVerify, bookController.deleteBookById); // delete book by id

export default route;
