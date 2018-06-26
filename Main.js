
wing.base_uri = "https://www.thegamecrafter.com";
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

window.app = new Vue({
    el: "#app",
    data: {
        username: "carl@phos.net", // TEMP: This is here for convenience, remove it later.
        password: "statictgc", // TEMP: This is here for convenience, remove it later.
        product: wing.object({
            vitalsTableItems: null,
            priceTableItems: null,
            fetch_api: "/api/part/" + partID,
            with_credentials: false,
            on_fetch: function(properties) {
                // QUESTION: Isn't there some better way to reference vitalsTableItems here, i.e. "this"?
                window.app.$data.product.vitalsTableItems =
                    getVitalsTableItems(window.app.$data.product.properties);
                window.app.$data.product.priceTableItems =
                    getPriceTableItems(window.app.$data.product.properties);
            }
        }),
        session: wing.object({
            with_credentials: false,
            create_api: "/api/session",
            on_create: function(properties) {
                localStorage.setItem("tgc_session_id", properties.id);
            },
            on_delete: function(properties) {
                localStorage.removeItem("tgc_session_id");
            },
            fetch_api: "/api/session/" + localStorage.getItem("tgc_session_id"),
            params: {
                _include_related_objects: ["user"],
                api_key_id: StaticTGC_api_key_id
            }
        }),
        cart: wing.object({
            with_credentials: false,
            create_api: "/api/cart",
            on_create: function(properties) {
                console.log("Properties.id is " + properties.id);
                console.log("Cart.properties.id is " + window.app.$data.cart.properties.id);
                localStorage.setItem("tgc_cart_id", properties.id);
            },
            fetch_api : "/api/cart/" + localStorage.getItem("tgc_cart_id"),
            params: {
                _include_related_objects: ["items"],
                api_key_id: StaticTGC_api_key_id
            }
        })
    },
    computed: {
        userName: function() {
                if (this.session.properties.user === undefined) {
                return "Unknown";
            } else {
                return this.session.properties.user.display_name;
            }
        }
    },
    methods: {
        onLoginSubmit (evt) {
            evt.preventDefault();
            this.session.create({
                username: this.username,
                password: this.password
            });
        },
        onLoginReset (evt) {
            evt.preventDefault();
            this.username = "";
            this.password = "";

            /* QUESTION: Do I need this trick to reset/clear native browser form validation state?
            this.login.show = false;
            this.$nextTick(() => { this.login.show = true });
            */
        },
        logOutClick: function(event) {
            var self = this;
            self.session.delete();
        },
        buyClick: function(event) {
            var self = this;
            if (!localStorage.getItem("tgc_cart_id")) {
                self.cart.create();
                // QUESION: How do I ensure the create() completes before the POST below?
            }
            console.log("Posting sale to cart.");
            self.cart.call('POST', "/api/cart/" + localStorage.getItem("tgc_cart_id") +
                "/sku/" + this.product.properties.sku_id, {quantity : 1},
                { on_success : function(properties) {
                    // TODO: This seems to create a cart if there isn't one: save this cart's ID.
                    wing.success('Added!');
                }
            });
        }
    },
    mounted() {
        this.product.fetch();

        if (localStorage.getItem("tgc_session_id")) {
            this.session.fetch();
        }

        if (localStorage.getItem("tgc_cart_id")) {
            this.cart.fetch();
        }
    }
})
