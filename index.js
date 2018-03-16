const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

//API configuration
var express = require('express'),
app = express(),
port = 9292;

async function f1() {
	var brands = await getBrands();
	console.log(brands);
}
//f1();

function insertWithBulk(toString)
{
	client.bulk({
		body: [toString]
	}, function (err, resp) {
	  // ...
	});
}

//Populate function
async function populate () {
	var brands = await getBrands();
	var toString = "";
	var id = 0;
	for(var i =0; i < 30; i++)//Change to 30 to brands.length but it is really long
	{
		var brand = brands[i];
		if(!(typeof brand === "undefined"))
		{
			var models = await getModels(brand);
			models.forEach(function(element)
			{
				console.log(element);
				toString += '{ "index":{ "_index": "suv", "_type":"suv", "_id": "'+id+'"} }\n';
				toString += JSON.stringify(element)+"\n";
				id++;
			});			
		}
		console.log("percentage " + (i/30) + "%");
	}
	console.log("finished the loading data");
	fs.writeFile('value.json', toString, function (err) {
		if (err) throw err;
	});
	console.log("Writing finished");
	insertWithBulk(toString);
}

//API route
app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/populate', (req, res) => {
	populate();
    res.send('Populate elasticsearch done');
});

app.listen(port);

console.log("Server launch on port " + port);