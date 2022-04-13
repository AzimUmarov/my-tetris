const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.port || 8080;

app.use(express.static('public'));

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.listen(PORT);

console.log('Running at Port ' + PORT);