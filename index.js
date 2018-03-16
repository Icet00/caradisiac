const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
var fs = require('fs');

//API configuration
var express = require('express'),
  app = express(),
  port = 9292;

async function f1() {
  var brands = await getBrands();
  console.log(brands);
}
//f1();

//Populate function
async function populate () {
  const models = await getModels('PEUGEOT');
  var toString = "";
  var id = 0;

  models.forEach(function(element) {

  		toString += '{ "index":{ "_id": "'+id+'"} }\n';
		toString += JSON.stringify(element)+"\n";
		id++;
	});

  fs.writeFile('value.json', toString, function (err) {
    if (err) throw err;
  });
}

//API route
app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(port);

console.log("Server launch on port " + port);