
/* TODO: Get data from the server. */

// vitalsData represents product data from the server.
const vitalsData = {
  quantityInStock: 5084,
  color: 'red',
  category: 'people',
  material: 'wood',
  weightOz: 0.05,
  heightIn: 0.63,
  widthIn: 0.61,
  depthIn: 0.40
}

// pricingData represents product price data from the server.
const pricingData = [
  "1:0.1171",
  "10:0.0806",
  "100:0.0644",
  "1000:0.0384"
]

// prices is an array of bulk pricing tiers, stored as numbers for calculation.
var prices = [];
var lastMin = NaN;
for (var i = pricingData.length - 1; i >= 0; i--) {
	var priceData = pricingData[i].split(":");
    var priceTier = {
    	min: Number(priceData[0]),
    	max: lastMin,
      price: Number(priceData[1])
    };
    lastMin = priceTier.min;
    prices.unshift(priceTier);
}

// priceTable is structured for the Bulk Pricing table display.
var priceTable = [];
for (var i = 0; i < prices.length; i++) {
  var rangeEnd;
  if (isNaN(prices[i].max)) {
    rangeEnd = "+";
  } else {
    rangeEnd = "-" + (prices[i].max - 1);
  }
  var priceRow = {};
  priceRow.range = "" + prices[i].min + rangeEnd;
  priceRow.ea = "$" + prices[i].price + " ea";
  priceTable.push(priceRow);
}

var productObj = {
    name: 'Meeple, Red',
    image: 'https://s3.amazonaws.com/files.thegamecrafter.com/7f2ccd947321d9af7fefe4e029107fe89588e8fd',
    /* Youtube URLs must be in this "/embed/" format - see https://stackoverflow.com/questions/9934944 */
    video: 'https://www.youtube.com/embed/Hj6N59wZi1I',
    alt: 'Photo of Meeple, Red',
    /* Vue appears unable to resolve &quot; entities in text, hence the \" characters. */
    description: 'These painted wood figurines, available in a variety of colors, \
      make a great alternative to pawns for board games with character.  Each one \
      stands 3/4\" tall by 5/8\" at the base, in the shape of the human \
      body with out-stretched arms.',
    unitPrice: prices[0].price.toFixed(2),
    priceTableItems: priceTable,
    priceTableFields: [
      {key: 'range', label: 'Bulk Pricing'},
      {key: 'ea', label: ''}
    ]
}

window.app = new Vue({
  el: "#app",
  data: {
    product: productObj
  }
})
