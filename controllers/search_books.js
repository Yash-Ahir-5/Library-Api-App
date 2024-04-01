const { QueryTypes } = require('sequelize');
const sequelize = require("../models");

// Modified searchBooks function
const searchBooksByParam = async (req, res) => {
    const { search_param } = req.params;
    try {
        const query = `
            SELECT DISTINCT
                b.id AS book_id,
                b.title AS book_title,
                b.description AS book_description,
                b.publish_year AS book_publish_year,
                b.quantity AS book_quantity,
                a.author_name,
                g.genre_name
            FROM 
                books b
            JOIN 
                book_authors ba ON b.id = ba.book_id
            JOIN 
                authors a ON ba.author_id = a.id
            JOIN 
                book_genres bg ON b.id = bg.book_id
            JOIN 
                genres g ON bg.genre_id = g.id
            WHERE 
                b.title LIKE $1 OR 
                a.author_name LIKE $2 OR
                g.genre_name LIKE $3
        `;

        // Execute the SQL query
        const results = await sequelize.query(query, {
            bind: [`%${search_param}%`, `%${search_param}%`, `%${search_param}%`],
            type: QueryTypes.SELECT
        });

        res.json(results);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { searchBooksByParam };
