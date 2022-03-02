import express from "express";
import mariadb from "mariadb";

import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());


export const config = {
    jwtSecret: process.env.JWT_SECRET || "",
    host: process.env.HOST || "127.0.0.1",
    mariadb: {
        host: process.env.MARIADB_HOST || "127.0.0.1",
        user: process.env.MARIADB_USER || "",
        password: process.env.MARIADB_PASSWORD || "",
        database: process.env.MARIADB_DATABASE || "",
        port: parseInt(process.env.MARIADB_PORT || "3306"),
    },
    port: parseInt(process.env.PORT || "4678")
};

const pool = mariadb.createPool(({
    ...config.mariadb,
    connectionLimit: 5,
}));

const getReviews = async (conn) => {
    return await conn.query("SELECT * FROM reviews");
}

const setReviews = async(conn, name, content)  => {
    const query = await conn.query("INSERT INTO reviews (name, content) VALUES (?, ?);", [name, content]);
    return query;
}

pool.getConnection().then(conn => {
            conn.query(`CREATE TABLE IF NOT EXISTS reviews (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            content varchar(255) NOT NULL,
            PRIMARY KEY (id)
          )`);

    app.get("/reviews", async (req, res) => {
        const reviews = await getReviews(conn);

        res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
        const {name, content} = req.body;

        if(name && content) {
            const response = await setReviews(conn, name, content);

            res.send(response);

            return;
        }

        res.sendStatus(401);


    });

    app.listen(config.port, config.host, () => {
            console.log(`Example app listening on port ${config.port}!`);
            console.log("started");
    });
})
