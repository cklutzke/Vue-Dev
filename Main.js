
// TODO: Is this the right URI to use for production?
const URI_prefix = "https://www.thegamecrafter.com";

// TODO: Get all product data from the server and remove the productData constant.
const partID = "DF0FDE0C-9A04-11E0-AACC-432941C43697";
const productData = {
  "depth" : 0.4,
  "height" : 0.63,
  "id" : "DF0FDE0C-9A04-11E0-AACC-432941C43697",
  "price" : "0.1171",
  "price_10" : "0.0806",
  "price_100" : "0.0644",
  "price_1000" : "0.0384",
  "quantity" : 6484,
  "width" : 0.61,
}

function ouncesToGrams(ounces) {
  // Returns a string in the format "#.## g" or an empty string.
  if (isNaN(ounces)) {
    return "";
  } else {
    return (Number(ounces) * 28.35).toFixed(2) + " g";
  }
}

function inchesToMm(inches) {
  // Returns a string in the format "#.## mm" or an empty string.
  if (isNaN(inches)) {
    return "";
  } else {
    return (Number(inches) * 25.4).toFixed(2) + " mm";
  }
}

// TODO: How can I generate these tables AFTER I get the product data from the server?
let productObj = {
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
    ]
}

console.log("Creating Vue object now.");

window.app = new Vue({
  el: "#app",
  data: {
    session: wing.object({
      with_credentials: false
    }),
    product: productObj,
    vueProduct: wing.object({
      fetch_api: URI_prefix + "/api/part/" + partID,
      with_credentials: false
    }),
    cart: wing.object({
      fetch_api : URI_prefix + '/api/cart/',
      // TODO: If I don't send credentials, I need to keep cart.id in localStorage.
      // TODO: It would be better if this process worked _with_ credentials.
        // To get user info, call http:///api/session?_include_related_objects=user
      with_credentials: false
    })
    /*,
    cartitems : wing.object_list({
        create_api : URI_prefix + '/api/game',
        list_api : URI_prefix + '/api/cart/' + cartid + '/items',
        params : { _items_per_page : 100, _order_by : 'name'},
        on_delete : function(object, index) {
            wing.success(properties.name + ' removed.');
            vm.$data.cart.fetch();
        },
    })
    */
  },
  methods: {
    buyClick: function(event) {
      var self = this;
      // Have browser check https://www.thegamecrafter.com/api/cart/[cart.properties.id]/items to see if items were successfully added.
      self.cart.call('POST', URI_prefix + '/api/cart//sku/' + this.vueProduct.properties.sku_id, {quantity : 1},
        { on_success : function(properties) {
          wing.success('Added!');
          // self.cartitems.reset()._all();
          // self.update_estimated_ship_date();
        }
      });
    }
  },
  mounted() {
    // TODO: If localStorage.tgcStaticSession is undefined...
    console.log("Getting ready to log in.");
    this.session.call('POST', URI_prefix + '/api/session', {
        username: "carl@phos.net",
        password: "statictgc",
        api_key_id: "034F04B4-7329-11E8-BA7A-8BFD93A6FE1D"
      },{
        on_success: function(properties) {
          console.log("Logged in.");
          // TODO: Store the session ID in localStorage.
        },
        on_error: function(properties) {
          console.log("Login failed.");
        }
      }
    )
    console.log("Getting ready to fetch data.");
    this.vueProduct.fetch();
    console.log("Fetch complete.");
  }
})
