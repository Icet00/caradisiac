const {getBrands} = require('node-car-api');
var fs = require('fs');

async function f1() {
  var brands = await getBrands();
  console.log(brands);
}
//f1();

const {getModels} = require('node-car-api');

async function print () {
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

print();