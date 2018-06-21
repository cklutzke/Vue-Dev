
// QUESTION: Is this the right URI to use for production?
const URI_prefix = "https://www.thegamecrafter.com";

const StaticTGC_api_key_id = "034F04B4-7329-11E8-BA7A-8BFD93A6FE1D";

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

// IDEA: Add Color, Category, and Material. With links to other matching parts.
// IDEA: Provide dropdowns to select different colors, materials, and sizes.
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

// TEMP: Generate these tables from server data in response to the product's on_fetch event?
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

function prepCart(cart) {
  if (localStorage.getItem("tgc_cart_id")) {
    cart.fetch();
  } else {
    cart.create();
  }
}

function displayCart(cart) {
    // TODO: Make this work somehow.
}

window.app = new Vue({
  el: "#app",
  data: {
    login: {
      show: true,
      username: "carl@phos.net", // TEMP: This is here for convenience, remove it later.
      password: "statictgc" // TEMP: This is here for convenience, remove it later.
    },
    priceTableItems: [],
    session: wing.object({
      with_credentials: false,
      create_api: URI_prefix + "/api/session",
      on_create: function(properties) {
        window.app.$data.login.username = "";
        window.app.$data.login.password = "";
        localStorage.setItem("tgc_session_id", window.app.$data.session.properties.id);
        window.app.$data.login.show = false;
        prepCart(window.app.$data.cart);
      },
      fetch_api: URI_prefix + "/api/session/" + localStorage.tgc_session_id,
      on_fetch: function(properties) {
          window.app.$data.login.show = false;
          prepCart(window.app.$data.cart);
      },
      on_delete: function(properties) {
      },
      params: {
        "_include_related_objects": ["user"],
        api_key_id: StaticTGC_api_key_id
      }
    }),
    product: productObj,
    vueProduct: wing.object({
      fetch_api: URI_prefix + "/api/part/" + partID,
      with_credentials: false,
      on_fetch: function() {
        // TODO: Maybe this is the right time to update those product info tables. Duh.
      }
    }),
    cart: wing.object({
      with_credentials: false,
      create_api: URI_prefix + "/api/cart",
      on_create: function(properties) {
        localStorage.setItem("tgc_cart_id", window.app.$data.cart.properties.id);
        displayCart(this);
      },
      fetch_api : URI_prefix + "/api/cart/" + localStorage.tgc_cart_id,
      on_fetch: function(properties) {
         displayCart(this);
      },
      params: {
        // QUESTION: Get related objects?
        api_key_id: StaticTGC_api_key_id
      }
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
    // BUG: Fetch isn't getting related data for the session, so this data is missing.
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
      var self = this;
      /*
      // BUG: A call to https://www.thegamecrafter.com/api/session/[session ID] shows the code below doesn't work.
      // JT says this is an error in his code, he'll fix it later.
      self.session.delete({});
      */
      // The kludge code below does log me out.
      self.session.call('DELETE', URI_prefix + '/api/session/' + this.session.properties.id, {},
        { on_success : function(properties) {
          // TEMP: When delete() works, the code below should be in session.on_delete().
          window.app.$data.login.show = true;
          // QUESTION: Should I clear the cart ID from localStorage here?
          localStorage.removeItem("tgc_session_id");
        }
      });
    },
    buyClick: function(event) {
      var self = this;
      // TODO: Use Wing methods to add the item to the cart, instead of brute-forcing it like this.
      // For now, check https://www.thegamecrafter.com/api/cart/[cart.properties.id]/items to see if items were successfully added.
      self.cart.call('POST', URI_prefix + '/api/cart//sku/' + this.vueProduct.properties.sku_id, {quantity : 1},
        { on_success : function(properties) {
          wing.success('Added!');
        }
      });
    }
  },
  mounted() {
    this.vueProduct.fetch();

    if (localStorage.getItem("tgc_session_id")) {
      this.session.fetch();
    } else {
      this.login.show;
    }
  }
})
