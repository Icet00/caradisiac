const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200'
});

//API configuration
var express = require('express'),
app = express(),
port = 9292;

//Bulk let us add many value in one time
function insertWithBulk(toString)
{
	client.bulk({
		body: [toString]
	});
}


//Populate function
async function populate () {
	var brands = await getBrands();
	var toString = "";
	var id = 0;
	var array_promise = [];//Keep all of them to wait at the end
	var counter_percentage = 0;
	for(var i =0; i < brands.length; i++)//May be long to wait, so you could change brands.length to 20/30
	{
		var brand = brands[i];
		array_promise[i] = new Promise(function(resolve, reject)
		{
			getModels(brand).then(function(models)
			{
				var hasInsert = false;
				models.forEach(function(element)
				{
					try {
						//Parse the volume to a number to correctly do the sorting in elasticsearch
						element.volume = parseInt(element.volume);
					}
					catch(error) {
						console.error(error);
					}
					toString += '{ "index":{ "_index": "suv", "_type":"suv", "_id": "'+id+'"} }\n';
					toString += JSON.stringify(element)+"\n";
					id++;
					hasInsert = true;
				});	
				if(hasInsert)
				{
					console.log("Added - percentage done : " + ((counter_percentage/brands.length)*100).toFixed(0));
				}
				counter_percentage++;
				resolve();
			})
			.catch(function()
			{
				//In error case
				counter_percentage++;
				console.log("Rejected - percentage done : " + ((counter_percentage/brands.length)*100).toFixed(0));
				resolve();
			});
		});
	}
	//Wait the end of all the promise
	Promise.all(array_promise).then(function(values) {
		/*
		//To write in a json file
		console.log("finished the loading data");
	    fs.writeFile('value.json', toString, function (err) {
			if (err) throw err;
		});*/
		insertWithBulk(toString);

		console.log("Insertion finished");
	});
}

function search()
{
	//Only the first one
	return client.search({
	    index: "suv",
	    type: 'suv',
	    body: {
	       sort: [{ "volume": { "order": "desc" } }],
	       size: 1,
	    }
 	});
}

//API route
app.get('/suv', (req, res) => {
	//Search the max volume of all the suv
	search().then(function(resp)
	{
    	res.send(resp);
	})
	.catch(function(error) {
		res.send(error);
	});
});

app.get('/populate', (req, res) => {
	//Populate with the package node-car-api
	populate();
    res.send('Populate elasticsearch started');
});

app.listen(port);

console.log("Server launch on port " + port);
