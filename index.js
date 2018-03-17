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
	var array_promise = [];
	console.log("length : " + brands.length);
	var counter_percentage = 0;
	for(var i =0; i < 20; i++)//Change to 30 to brands.length but it is really long
	{
		var brand = brands[i];
		array_promise[i] = new Promise(function(resolve, reject)
		{
			getModels(brand).then(function(models)
			{
				models.forEach(function(element)
				{
					try {
						element.volume = parseInt(element.volume);
						console.log(element);
					}
					catch(error) {
						console.error(error);
					}
					toString += '{ "index":{ "_index": "suv", "_type":"suv", "_id": "'+id+'"} }\n';
					toString += JSON.stringify(element)+"\n";
					id++;
				});	
				counter_percentage++;
				//console.log("Added - percentage done : " + ((counter_percentage/brands.length)*100).toFixed(0));
				resolve();
			})
			.catch(function()
			{
				//In error case
				counter_percentage++;
				//console.log("Rejected - percentage done : " + ((counter_percentage/brands.length)*100).toFixed(0));
				resolve();
			});
		});
	}
	
	Promise.all(array_promise).then(function(values) {
		console.log("finished the loading data");
	    fs.writeFile('value.json', toString, function (err) {
			if (err) throw err;
		});
		console.log("Writing finished");
		insertWithBulk(toString);
	});
}

public function search()
{
	
}

//populate();
/*
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
*/