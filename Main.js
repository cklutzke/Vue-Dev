
// QUESTION: Is this the right URI to use for production?
const URI_prefix = "https://www.thegamecrafter.com";
const StaticTGC_api_key_id = "034F04B4-7329-11E8-BA7A-8BFD93A6FE1D";
const partID = "DF0FDE0C-9A04-11E0-AACC-432941C43697";

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

function getPriceTableItems(productProperties) {
    console.log("getPriceTableItems");
    return [
      {range: "1-9", ea: "$" + productProperties.price + " ea"},
      {range: "10-99", ea: "$" + productProperties.price_10 + " ea"},
      {range: "100-999", ea: "$" + productProperties.price_100 + " ea"},
      {range: "1000+", ea: "$" + productProperties.price_1000 + " ea"}
  ];
}

// IDEA: Add Color, Category, and Material. With links to other matching parts.
// IDEA: Provide dropdowns to select different colors, materials, and sizes.
function getVitalsTableItems(productProperties) {
    return [
      {key: "Quantity in Stock", value1: productProperties.quantity, value2: ""},
      {key: "Weight", value1: Number(productProperties.weight).toFixed(2) + " oz",
        value2: ouncesToGrams(productProperties.weight)},
      {key: "Height", value1: Number(productProperties.height).toFixed(2) + " in",
        value2: inchesToMm(productProperties.height)},
      {key: "Width", value1: Number(productProperties.width).toFixed(2) + " in",
        value2: inchesToMm(productProperties.width)},
      {key: "Depth", value1: Number(productProperties.depth).toFixed(2) + " in",
        value2: inchesToMm(productProperties.depth)}
    ];
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
    product: wing.object({
        vitalsTableItems: null,
        priceTableItems: null,
        fetch_api: URI_prefix + "/api/part/" + partID,
        with_credentials: false,
        on_fetch: function() {
            // QUESTION: Isn't there some better way to reference this wing object here, i.e. "this"?
            window.app.$data.product.vitalsTableItems =
                getVitalsTableItems(window.app.$data.product.properties);
            window.app.$data.product.priceTableItems =
                getPriceTableItems(window.app.$data.product.properties);
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
      self.cart.call('POST', URI_prefix + '/api/cart//sku/' + this.product.properties.sku_id, {quantity : 1},
        { on_success : function(properties) {
          wing.success('Added!');
        }
      });
    }
  },
  mounted() {
    this.product.fetch();

    if (localStorage.getItem("tgc_session_id")) {
      this.session.fetch();
    } else {
      this.login.show;
    }
  }
})
