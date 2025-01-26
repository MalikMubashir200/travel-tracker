import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

env.config()
const db =  new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_KEY,
  port: process.env.PG_PORT,
})

db.connect();

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const countries = []
   const result = await db.query("SELECT country_code FROM visited_countries")
   result.rows.forEach((country) => {
      countries.push(country.country_code)
   });
   res.render("index.ejs",{countries:countries,total:countries.length})
})

app.post("/add", async (req, res) => {
 const input = req.body["country"];

 const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1",
  [input]
 )
 
 if (result.rows.length !== 0){
  const data =  result.rows[0];
  const country_code = data.country_code;
  await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",
    [country_code]
  )
  res.redirect("/")
 } else{
   res.status(400).send("Country not found in the database.");
 }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
