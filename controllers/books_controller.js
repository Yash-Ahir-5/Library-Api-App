const { QueryTypes } = require('sequelize')
const sequelize = require("../models")

const fetchBookData = async () => {
    try {
        const books = await sequelize.query("SELECT * FROM books", {
            type: QueryTypes.SELECT
        });
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

const getAllBooks = async (req, res) => {
    try {
        const books = await sequelize.query(`SELECT 
                b.id AS book_id, 
                b.title AS book_title, 
                b.description AS book_description, 
                b.publish_year AS book_publish_year, 
                b.quantity AS book_quantity, 
                a.author_name AS book_author, 
                g.genre_name AS book_genre
                FROM books b 
                JOIN book_authors ba ON b.id = ba.book_id 
                JOIN authors a ON ba.author_id = a.id 
                JOIN book_genres bg ON b.id = bg.book_id 
                JOIN genres g ON bg.genre_id = g.id`,
            {
                type: QueryTypes.SELECT
            });
        return res.status(200).json(books)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const insertBook = async (req, res) => {
    const { title, description, publish_year, quantity, author_name, genre_name } = req.body;
    try {
        // Find author_id and genre_id using author_name and genre_name
        const [author] = await sequelize.query(`
            SELECT id FROM authors WHERE author_name = ?
        `, {
            replacements: [author_name],
            type: QueryTypes.SELECT
        });

        const [genre] = await sequelize.query(`
            SELECT id FROM genres WHERE genre_name = ?
        `, {
            replacements: [genre_name],
            type: QueryTypes.SELECT
        });

        if (!author || !genre) {
            return res.status(400).json({ error: "Author or genre not found" });
        }

        // Insert book data
        const [bookId] = await sequelize.query(`
            INSERT INTO books (title, description, publish_year, quantity) 
            VALUES (?, ?, ?, ?)
        `, {
            replacements: [title, description, publish_year, quantity],
            type: QueryTypes.INSERT
        });

        // Insert into book_authors table
        await sequelize.query(`
            INSERT INTO book_authors (book_id, author_id) 
            VALUES (?, ?)
        `, {
            replacements: [bookId, author.id],
            type: QueryTypes.INSERT
        });

        // Insert into book_genres table
        await sequelize.query(`
            INSERT INTO book_genres (book_id, genre_id) 
            VALUES (?, ?)
        `, {
            replacements: [bookId, genre.id],
            type: QueryTypes.INSERT
        });

        // Call the function to fetch all books
        const books = await fetchBookData();

        res.status(200).json({ message: "Book data inserted successfully", books: books });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to insert book data" });
    }
}

const updateBook = async (req, res) => {
    const { id } = req.params;
    const { title , description , publish_year , quantity } = req.body;

    try {
        await sequelize.query(`
            UPDATE books
            SET title = ?, description = ?, publish_year = ?, quantity = ?
            WHERE id = ?
        `, {
            replacements: [ title , description , publish_year , quantity , id ],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all books
        const books = await fetchBookData();

        res.status(200).json({ message: "Books Data updated successfully", books: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update book data" });
    }
};

const deleteBook = async (req, res) => {
    const { id } = req.params; // Extract user ID from URL parameter
    try {
        await sequelize.query(`
        DELETE from books
        WHERE id = ?
        `, {
            replacements: [id],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all books
        const books = await fetchBookData();

        res.status(200).json({ message: "Book Data deleted successfully", books: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete book data" });
    }
}

module.exports = {
    getAllBooks,
    insertBook,
    updateBook,
    deleteBook
}
