const express = require('express');
const router = express();
require('../models')
const { getAllBooks, insertBook, updateBook, deleteBook } = require('../controllers/books_controller');
const { getAllAuthors, insertAuthor, updateAuthor, deleteAuthor } = require('../controllers/author_controller');
const { getAllGenres, insertGenre, updateGenre, deleteGenre } = require('../controllers/genre_controller');
const {searchBooksByParam} = require('../controllers/search_books');
const { register, login } = require('../controllers/admin');
const { verifyToken } = require('../middlewares/authenticate');

router.get('/', (req, res) => {
    res.send("Hello")
})

//books API's
router.get('/books',getAllBooks);
router.post('/books/insert',insertBook);
router.post('/books/update/:id',updateBook);
router.post('/books/delete/:id',deleteBook);

//authors API's
router.get('/authors',getAllAuthors);
router.post('/authors/insert',insertAuthor);   
router.post('/authors/update/:id',updateAuthor);
router.post('/authors/delete/:id',deleteAuthor);

//genres API's
router.get('/genres',getAllGenres);
router.post('/genres/insert',insertGenre);   
router.post('/genres/update/:id',updateGenre);
router.post('/genres/delete/:id',deleteGenre);

//admin API's
router.post('/admin/register',register);
router.post('/admin/login',login);           


// Express route setup
router.get('/search/:search_param', searchBooksByParam);

module.exports = router