require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dns = require("dns")
const urlparser = require("url")
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({ original_url: { type: String}, short_url: { type: String} }); 
const Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/', (req, res) => {
  
  const url = req.body.url
  const bodyUrl = req.body.url
  
  dns.lookup(urlparser.parse(bodyUrl).hostname, (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const newUrl = new Url({
        original_url: url
      })
      newUrl.save()
      console.log(newUrl)
      res.json({
        original_url: url,
        short_url: newUrl._id
      })
    }
  });


});

app.get('/api/shorturl/:id', async (req, res) => {
  const id = req.params.id
  console.log(id)
  const log = await Url.findById(id)
  if (!log) {
    res.json({error: "Invalid URL"})
  } else {
    res.redirect(log.original_url)
  }  
});




app.listen(process.env.PORT, function() {
  console.log(`Listening on port ${process.env.PORT}`);
});
