
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

window.app = new Vue({
    el: "#app",
    data: {
        username: "carl@phos.net", // TEMP: This is here for convenience, remove it later.
        password: "statictgc", // TEMP: This is here for convenience, remove it later.
        product: wing.object({
            fetch_api: "/api/part/" + partID,
            with_credentials: false
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
            // We never explicitly create a cart. It's created the first time the
            // user adds an item, and then we put the ID in localStorage.
            with_credentials: false,
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
        },
        priceTableItems: function () {
            productProperties = this.product.properties;
            return [
                {range: "1-9", ea: "$" + productProperties.price + " ea"},
                {range: "10-99", ea: "$" + productProperties.price_10 + " ea"},
                {range: "100-999", ea: "$" + productProperties.price_100 + " ea"},
                {range: "1000+", ea: "$" + productProperties.price_1000 + " ea"}
            ];
        },
        // IDEA: Add Color, Category, and Material. With links to other matching parts.
        // IDEA: Provide dropdowns to select different colors, materials, and sizes.
        vitalsTableItems: function () {
            productProperties = this.product.properties;
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
        },
        logOutClick: function(event) {
            var self = this;
            self.session.delete();
        },
        buyClick: function(event) {
            let cartId = localStorage.getItem("tgc_cart_id");
            if (!cartId) {
                cartId = "";
            }
            var self = this;
            self.cart.call('POST', "/api/cart/" + cartId + "/sku/" +
                this.product.properties.sku_id, {quantity : 1},
                { on_success : function(properties) {
                    wing.success('Added!');
                    if (!localStorage.getItem("tgc_cart_id")) {
                        localStorage.setItem("tgc_cart_id", properties.id);
                    };
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
