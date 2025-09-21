const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scraping-5fdb8-default-rtdb.firebaseio.com"
});

const db = admin.database();
const app = express();
const PORT = process.env.PORT || 3000;

// Função de raspagem
async function raspar() {
  const { data } = await axios.get("http://maxplusv3.maxplusoapp.site/");
  const $ = cheerio.load(data);

  let filmes = [];
  $(".item-filme").each((i, el) => {
    filmes.push({
      titulo: $(el).find(".titulo").text(),
      tipo: "Filme",
      capa: $(el).find("img").attr("src"),
      link: $(el).find("a").attr("href")
    });
  });

  const ref = db.ref("catalogo");
  filmes.forEach(f => ref.push(f));

  return { status: "ok", total: filmes.length };
}

// Rota principal
app.get("/", (req, res) => {
  res.send("API do Scraper funcionando!");
});

// Rota para executar o scraper
app.get("/scraper", async (req, res) => {
  try {
    const resultado = await raspar();
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "erro", message: err.message });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
