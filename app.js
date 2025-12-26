const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const userModel = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send("Enter everything!");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exist...");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {

        let createdUser = await userModel.create({
          username,
          password: hash,
          email,
        });

        
        let token = jwt.sign({ email }, "csabagsoph38y8bfvj");
        res.cookie("token", token);

        res.send(createdUser);
      });
    });

  } catch (err) {
    res.status(500).send("Error creating user");
  }
});


app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/resetpassword", (req, res) => {
  res.render("forgotPassword");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
