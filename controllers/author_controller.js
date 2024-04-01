const { QueryTypes } = require('sequelize')
const sequelize = require("../models")

const fetchAuthorData = async () => {
    try {
        const authors = await sequelize.query("SELECT * FROM authors", {
            type: QueryTypes.SELECT
        });
        return authors;
    } catch (error) {
        console.error("Error fetching authors:", error);
        throw error;
    }
};

const getAllAuthors = async (req, res) => {
    try {
        const authors = await sequelize.query(`SELECT * FROM authors`,{
                type: QueryTypes.SELECT
            });
        return res.status(200).json(authors)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const insertAuthor = async (req, res) => {
    const { author_name , biography } = req.body;
    try {
    
        // Insert Author data
        const [bookId] = await sequelize.query(`
            INSERT INTO authors ( author_name , biography ) 
            VALUES (?, ?)
        `, {
            replacements: [author_name , biography],
            type: QueryTypes.INSERT
        });

        // Call the function to fetch all books
        const authors = await fetchAuthorData();

        res.status(200).json({ message: "Author data inserted successfully", authors: authors });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to insert author data" });
    }
}

const updateAuthor = async (req, res) => {
    const { id } = req.params;
    const { author_name , biography } = req.body;

    try {
        await sequelize.query(`
            UPDATE authors
            SET author_name = ?, biography = ?
            WHERE id = ?
        `, {
            replacements: [ author_name , biography , id ],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all authors
        const authors = await fetchAuthorData();

        res.status(200).json({ message: "Author Data updated successfully", authors: authors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update author data" });
    }
};

const deleteAuthor = async (req, res) => {
    const { id } = req.params; // Extract user ID from URL parameter
    try {
        const count = await sequelize.query(`
            SELECT COUNT(*) FROM book_authors WHERE author_id = ?
        `, {
            replacements: [id],
            type: QueryTypes.SELECT
        });

        // Check if the author is connected with any books
        // If there is at least one record in book_authors with the same author_id, the count will be greater than 0
        // If so, the author cannot be deleted
        // We return a 400 error with a message to the client
        if (count[0]['COUNT(*)'] > 0) { 
           
            return res.status(400).json({ error: "Author is connected with books and cannot be deleted" });
        }

        await sequelize.query(`
            DELETE from authors
            WHERE id = ?
        `, {
            replacements: [id],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all authors
        const authors = await fetchAuthorData();

        res.status(200).json({ message: "Author Data deleted successfully", authors: authors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete author data" });
    }
}


module.exports = {
    getAllAuthors,
    insertAuthor,
    updateAuthor,
    deleteAuthor
}