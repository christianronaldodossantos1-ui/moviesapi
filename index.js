const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://scraping-5fdb8-default-rtdb.firebaseio.com"
});

const db = admin.database();

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

module.exports = async (req, res) => {
  const resultado = await raspar();
  res.json(resultado);
};