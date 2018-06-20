
// TODO: Is this the right URI to use for production?
const URI_prefix = "https://www.thegamecrafter.com";

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

// TODO: Get all product data from the server and remove the productData constant.
// TODO: Add Color, Category, and Material. With links to other matching parts.
// TODO: Provide dropdowns to select different colors, materials, and sizes.
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

// TODO: Can I generate these tables in response to the product's on_fetch event?
let productObj = {
    vitalsTableItems: [
      {key: "Quantity in Stock", value1: productData.quantity, value2: ""},
      {key: "Weight", value1: Number(productData.weight).toFixed(2) + " oz",
        value2: ouncesToGrams(productData.weight)},
      {key: "Height", value1: Number(productData.height).toFixed(2) + " in",
        value2: inchesToMm(productData.height)},
      {key: "Width", value1: Number(productData.width).toFixed(2) + " in",
        value2: inchesToMm(productData.width)},
      {key: "Depth", value1: Number(productData.depth).toFixed(2) + " in",
        value2: inchesToMm(productData.depth)}
    ],
    priceTableItems: [
      {range: "1-9", ea: "$" + productData.price + " ea"},
      {range: "10-99", ea: "$" + productData.price_10 + " ea"},
      {range: "100-999", ea: "$" + productData.price_100 + " ea"},
      {range: "1000+", ea: "$" + productData.price_1000 + " ea"}
    ]
}

window.app = new Vue({
  el: "#app",
  data: {
    login: {
      show: true,
      username: "",
      password: ""
    },
    priceTableItems: [],
    session: wing.object({
      create_api: URI_prefix + "/api/session",
      with_credentials: false,
      on_create: function(properties) {
        window.app.$data.login.username = '';
        window.app.$data.login.password = '';
        window.app.$data.login.show = false;
      },
      on_delete: function(properties) {
        window.app.$data.login.show = true;
      },
      params: {
        "_include_related_objects": ["user"],
        api_key_id: "034F04B4-7329-11E8-BA7A-8BFD93A6FE1D"
      }
    }),
    product: productObj,
    vueProduct: wing.object({
      fetch_api: URI_prefix + "/api/part/" + partID,
      with_credentials: false,
      on_fetch: function() {
        console.log("Product data has been fetched.");
      }
    }),
    cart: wing.object({
      fetch_api : URI_prefix + '/api/cart/',
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
  computed: {
    userName: function() {
      if (this.session.properties.user === undefined) {
        return "Not logged in.";
      } else {
        return this.session.properties.user.display_name;
      }
    }
  },
  methods: {
    onLoginSubmit (evt) {
      evt.preventDefault();
      this.session.create({
        username: this.login.username,
        password: this.login.password
      });
    },
    onLoginReset (evt) {
      evt.preventDefault();
      this.login.username = '';
      this.login.password = '';
      /* Trick to reset/clear native browser form validation state */
      this.login.show = false;
      this.$nextTick(() => { this.login.show = true });
    },
    logOutClick: function(event) {
      // TODO: A call to https://www.thegamecrafter.com/api/session/[session ID] shows this doesn't work.
      // Network activity shows it didn't actually call the server. See error below:
      /*
      Uncaught (in promise) TypeError: Cannot read property 'data' of undefined
          at wing.vue.js?v=1:444
          (anonymous) @ wing.vue.js?v=1:444
          Promise.catch (async)
          delete @ wing.vue.js?v=1:442
          logOutClick @ Main.js:122
          invoker @ vue.js:2025
          fn._withTask.fn._withTask @ vue.js:1828
      */
      this.session.delete({
      });
      /* The code below did log me out, but didn't refresh the page.
      var self = this;
      self.cart.call('DELETE', URI_prefix + '/api/session/' + this.session.properties.id, {},
        { on_success : function(properties) {
          self.session.reset();
          wing.success('Logged out.');
        }
      });
      */
    },
    buyClick: function(event) {
      var self = this;
      // TODO: Show the contents of the cart.
      // For now, check https://www.thegamecrafter.com/api/cart/[cart.properties.id]/items to see if items were successfully added.
      self.cart.call('POST', URI_prefix + '/api/cart//sku/' + this.vueProduct.properties.sku_id, {quantity : 1},
        { on_success : function(properties) {
          wing.success('Added!');
          // self.cartitems.reset()._all();
        }
      });
    }
  },
  mounted() {
    // TODO: Check localStorage to see if there's a cart ID.
    this.vueProduct.fetch();
  }
})
