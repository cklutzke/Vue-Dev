
/* TODO: Get productData from the server. */
// productData represents product data from the server.
const productData = {
  "badge" : null,
  "box" : 0,
  "category" : "People",
  "color" : "Red",
  "date_created" : "2011-06-18 23:44:13",
  "date_published" : "2017-07-13 21:57:14",
  "date_updated" : "2018-06-12 20:45:38",
  "departments" : [
     "game-pieces"
  ],
  "depth" : 0.4,
  "description" : "These painted wood figurines, available in a variety of colors, make a great alternative to pawns for board games with character.  Each one stands 3/4\" tall by 5/8\" at the base, in the shape of the human body with out-stretched arms.",
  "discontinued" : 0,
  "family" : "Wood Meeples",
  "for_resale" : 1,
  "height" : 0.63,
  "id" : "DF0FDE0C-9A04-11E0-AACC-432941C43697",
  "interior_depth" : 0,
  "interior_height" : 0,
  "interior_width" : 0,
  "keywords" : "carcassonne, rampage",
  "last_price_change" : "2018-01-24 01:44:12",
  "low_volume" : 0,
  "made_on_demand" : 0,
  "material" : "Wood",
  "msrp" : 0.4,
  "msrp_10" : 0.38,
  "msrp_100" : 0.36,
  "msrp_1000" : 0.3358,
  "name" : "Meeple, Red",
  "number_of_sides" : 0,
  "object_name" : "Part",
  "object_type" : "part",
  "on_sale" : 0,
  "original_price" : "0.1171",
  "original_price_10" : "0.0806",
  "original_price_100" : "0.0644",
  "original_price_1000" : "0.0384",
  "photo_size" : "300x300",
  "preview_uri" : "//s3.amazonaws.com/preview.thegamecrafter.com/85C5BBEE-FB1D-11E0-A7F1-96F09866D12C.png",
  "price" : "0.1171",
  "price_10" : "0.0806",
  "price_100" : "0.0644",
  "price_1000" : "0.0384",
  "public" : 1,
  "quantity" : 6484,
  "quantity_available_for_games" : 6284,
  "quantity_available_for_shop" : 5084,
  "sale_ends" : "2013-01-01 00:00:00",
  "sale_price" : 0,
  "shop_uri" : "/parts/meeple-red",
  "size_in_mm" : 15,
  "sku_id" : "DF0FE6E0-9A04-11E0-AACC-432941C43697",
  "supplies" : 0,
  "uri_part" : "meeple-red",
  "usable_in_games" : 1,
  "vintage" : 0,
  "virtual" : 0,
  "weight" : 0.0502,
  "width" : 0.61,
  "youtube_video_id" : "Hj6N59wZi1I"
}

function ouncesToGrams(ounces) {
  // Returns a string in the format "#.## g".
  // TODO: Throw an exception if ounces isNaN.
  return (Number(ounces) * 28.35).toFixed(2) + " g";
}

function inchesToMm(inches) {
  // Returns a string in the format "#.## mm".
  // TODO: Throw an exception if inches isNaN.
  return (Number(inches) * 25.4).toFixed(2) + " mm";
}

// TODO: Should I use "let" instead of "var"? To avoid "hoisting"?
var productObj = {
    name: productData.name,
    image: "http:" + productData.preview_uri,
    alt: "Photo of " + productData.name,
    description: productData.description,
    // Youtube URLs must be in this "/embed/" format - see https://stackoverflow.com/questions/9934944
    video: "https://www.youtube.com/embed/" + productData.youtube_video_id,
    unitPrice: "$" + Number(productData.price).toFixed(2),
    vitalsTableItems: [
      {key: "Quantity in Stock", value1: productData.quantity, value2: ""},
      // TODO: Add Color, Category, and Material. With links to other matching parts.
      // TODO: Provide dropdowns to select different colors, materials, and sizes.
      {key: "Weight", value1: Number(productData.weight).toFixed(2) + " oz",
        value2: ouncesToGrams(productData.weight)},
      {key: "Height", value1: Number(productData.height).toFixed(2) + " in",
        value2: inchesToMm(productData.height)},
      {key: "Width", value1: Number(productData.width).toFixed(2) + " in",
        value2: inchesToMm(productData.width)},
      {key: "Depth", value1: Number(productData.depth).toFixed(2) + " in",
        value2: inchesToMm(productData.depth)}
    ],
    vitalsTableFields: [
      {key: "key", label: "Vitals"},
      {key: "value1", label: ""},
      {key: "value2", label: ""}
    ],
    priceTableItems: [
      {range: "1-9", ea: "$" + productData.price + " ea"},
      {range: "10-99", ea: "$" + productData.price_10 + " ea"},
      {range: "100-999", ea: "$" + productData.price_100 + " ea"},
      {range: "1000+", ea: "$" + productData.price_1000 + " ea"}
    ],
    priceTableFields: [
      {key: "range", label: "Bulk Pricing"},
      {key: "ea", label: ""}
    ],
    lastPriceChange: productData.last_price_change.split(" ")[0]
}

window.app = new Vue({
  el: "#app",
  data: {
    product: productObj,
    //cart: wing.object({
    //  fetch_api : '/api/cart/'
    //})
  },
  methods: {
    // TODO: Why should I use arrow functions? So I don't have to use "bind(this)"?
    buyClick: function(event) {
      // TODO: Copy and adapt code from cart.tt -> add_item(sku_id).
      alert(typeof(wing));
    }
  }
})
