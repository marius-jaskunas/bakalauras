const bodyParser = require("body-parser");
const config = require("config");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const url = config.get("mongoDb");
//"mongodb://localhost/ServiceManager"
const app = require("express")();

app.use(function(req, res, next) {
    var allowedOrigins = ["http://localhost:8080", "https://bakalauras.s3.eu-central-1.amazonaws.com"];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "Set-Cookie");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(cookieParser());

app.options("*", function (req,res) { res.sendStatus(200); });

if (!config.get("authKey")) {
    console.error("FATAL ERROR: authKey is not defined.");
    process.exit(1);
}

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

mongoose.connect(url, { useNewUrlParser: true});

const db = mongoose.connection;
if(!db)
    console.log("Error connecting db");
else
    console.log("Db connected successfully");

const port = process.env.PORT || 5000;

const apiRoutes = require("./api-routes");
app.use("/api", apiRoutes);

app.listen(port, function(){
    console.log(`listening on *:${port}`);
});