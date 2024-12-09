import bookModel from "./../models/book.model.js";
import mongoose from "mongoose";

const checkISBNExist = (isbn) => {
  return bookModel.findOne({ isbn }).exec();
};

const addNewBook = async (req, res) => {
  try {
    const { name, year, author, isbn } = req.body;
    // check isbn already exist
    const existingBook = await checkISBNExist(isbn);
    if (existingBook) {
      return res.status(400).send({ error: "Book is already saved." });
    }

    const book = new bookModel({
      name,
      year,
      author,
      isbn,
      img: req.file ? req.file.path.replace(/\\/g, "/") : null,
    });

    await book.save();
    return res.status(200).send({ message: "Book added successfully." });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const getBooks = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const searchQuery = req.query.search;

    let query = {};
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query = { $or: [{ name: searchRegex }, { author: searchRegex }] };
    }

    const totalBooks = await bookModel.countDocuments(query); // return all books count
    const totalPages = Math.ceil(totalBooks / limit);

    const skip = (page - 1) * limit;

    const books = await bookModel.find(query).skip(skip).limit(limit);

    res.status(200).json({ books, totalPages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const query = { _id: new mongoose.Types.ObjectId(bookId) };

  let updatedImagePath = req.body.img;
  if (req.file && req.file.path) {
    updatedImagePath = req.file.path.replace(/\\/g, "/");
  }

  try {
    const updatedBook = { ...req.body, img: updatedImagePath };
    await bookModel.updateOne(query, updatedBook);
    return res.status(200).send({ message: "Book updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    await bookModel.findByIdAndDelete(bookId);
    res.status(200).send({ message: "Book deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export default {
  addNewBook,
  getBooks,
  updateBook,
  deleteBookById,
};
