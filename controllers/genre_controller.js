const { QueryTypes } = require('sequelize')
const sequelize = require("../models")

const fetchGenreData = async () => {
    try {
        const genres = await sequelize.query("SELECT * FROM genres", {
            type: QueryTypes.SELECT
        });
        return genres;
    } catch (error) {
        console.error("Error fetching Genres:", error);
        throw error;
    }
};

const getAllGenres = async (req, res) => {
    try {
        const genres = await sequelize.query(`SELECT * FROM genres`,{
                type: QueryTypes.SELECT
            });
        return res.status(200).json(genres)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const insertGenre = async (req, res) => {
    const { genre_name } = req.body;
    try {
    
        // Insert Author data
        const [bookId] = await sequelize.query(`
            INSERT INTO genres ( genre_name ) 
            VALUES (?)
        `, {
            replacements: [genre_name],
            type: QueryTypes.INSERT
        });

        // Call the function to fetch all books
        const genres = await fetchGenreData();

        res.status(200).json({ message: "Genre data inserted successfully", genres: genres });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to insert genre data" });
    }
}

const updateGenre = async (req, res) => {
    const { id } = req.params;
    const { genre_name } = req.body;

    try {
        await sequelize.query(`
            UPDATE genres
            SET genre_name = ?
            WHERE id = ?
        `, {
            replacements: [ genre_name , id ],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all genres
        const genres = await fetchGenreData();

        res.status(200).json({ message: "Gerne Data updated successfully", genres: genres });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update genre data" });
    }
};

const deleteGenre = async (req, res) => {
    const { id } = req.params; // Extract user ID from URL parameter
    try {
        const count = await sequelize.query(`
            SELECT COUNT(*) FROM book_genres WHERE genre_id = ?
        `, {
            replacements: [id],
            type: QueryTypes.SELECT
        });

        // Check if the genre is connected with any books
        // If there is at least one record in book_genres with the same genre_id, the count will be greater than 0
        // If so, the genre cannot be deleted
        // We return a 400 error with a message to the client
        if (count[0]['COUNT(*)'] > 0) { 
           
            return res.status(400).json({ error: "Genre is connected with books and cannot be deleted" });
        }

        await sequelize.query(`
            DELETE from genres
            WHERE id = ?
        `, {
            replacements: [id],
            type: QueryTypes.UPDATE
        });

        // Call the function to fetch all genres
        const genres = await fetchGenreData();

        res.status(200).json({ message: "Genre Data deleted successfully", genres: genres });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete genre data" });
    }
}

module.exports = {
    getAllGenres,
    insertGenre,
    updateGenre,
    deleteGenre
}