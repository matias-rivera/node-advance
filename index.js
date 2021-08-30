const dotenv = require("dotenv");
dotenv.config({});
const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const keys = require("./config/keys");

require("./models/User");
require("./models/Blog");
require("./services/passport");
require("./services/cache");

mongoose.Promise = global.Promise;
/* mongoose.connect(keys.mongoURI, {
    useMongoClient: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
}); */

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(keys.mongoURI, {
            useMongoClient: true,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        });
        console.log(`MongoDB connect: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

const app = express();

app.use(bodyParser.json());
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [keys.cookieKey],
    })
);
app.use(passport.initialize());
app.use(passport.session());

require("./routes/authRoutes")(app);
require("./routes/blogRoutes")(app);

if (["production", "ci"].includes(process.env.NODE_ENV)) {
    app.use(express.static("client/build"));

    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve("client", "build", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Listening on port`, PORT);
});
