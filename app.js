  const express = require("express");
  const app = express();
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  const path = require("path");
  const userModel = require("./models/user");
  const user = require("./models/user");
  const cookieParser = require('cookie-parser')
  const postModel = require("./models/post");
  const { upload } = require("./config/multerconfig");
  

  app.set("view engine", "ejs");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(cookieParser())




  

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
  app.get('/login' , (req ,res)=>{
    res.render('login')
  })



app.get("/uploadprofile" , (req ,res)=>{
  res.render("uploadprofile");
})

app.post("/upload" ,isLoggedIn , upload.single('avatar') , async (req ,res)=>{
  const user = await userModel.findById(req.user.id);
  user.profilePic = req.file.filename ;
  await user.save();
  res.redirect("/profile"); 
  

})


  app.post("/login",  async (req, res) => {
    try {
      const {email , password } = req.body ;

      const loginUser = await userModel.findOne({email});
      if(!loginUser) {
        return res.status(400).send("Register First Then Login!");
      }

      const isPasswordMatch = await bcrypt.compare(password , loginUser.password);

      if(!isPasswordMatch){
        return res.status(400).send("Invalid Password...");

      }

      const token = jwt.sign({id : loginUser._id} , "csabagsoph38y8bfvj");
      res.cookie("token" , token , {httpOnly : true });


      res.send("Login Successfully...");



    }
    catch (err) {
      res.status(500).send("Login Error....")

    }

  
  });

  app.get("/resetpassword", (req, res) => {
    res.render("forgotPassword");
  });

app.post("/resetpassword", async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // ⚠️ TEMP FIX (until JWT middleware)
    const user = await userModel.findOne(); 

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isMatched) {
      return res.status(400).send("Old password incorrect");
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.password = hash;
    await user.save();

    res.send("Password reset successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Reset password error");
  }
});


app.get("/like/:id", isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.id);

  const userId = req.user.id; 

  const index = post.likes.indexOf(userId);

  if (index === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(index, 1);
  }

  await post.save();
  res.redirect("/profile");
});


app.get("/logout" , (req , res)=>{
    res.cookie("token" , " ");
    res.send("Logout Successfully...");
    res.redirect('/register');
  })


app.get("/profile" , isLoggedIn , async (req , res)=>{
    const user =  await userModel.findById(req.user.id).populate('posts');
    res.render("profile" , {user});


  
  })

app.post("/createpost", isLoggedIn, async (req, res) => {
  const { content } = req.body;

  const user = await userModel.findById(req.user.id);

  const post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile");
});



app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const post =  await postModel.findOne({_id : req.params.id}).populate('user');

  res.render("edit" , {post});
});


app.post("/update/:id", isLoggedIn, async (req, res) => {
    const post =  await postModel.findOneAndUpdate({_id : req.params.id , user : req.user.id} , {content : req.body.content});

    res.redirect("/profile");
});

   

// DELETE POST TO DO 



// Middle ware for protected routes 


function isLoggedIn(req , res ,next){
    try{
      const token = req.cookies.token ;        
      if(!token){
        return res.status(401).send("Login First to access this page...");
      }
  
      const data = jwt.verify(token , "csabagsoph38y8bfvj");
      req.user = data ;
      next();
    }
    catch(err){
      return res.status(401).send("Login First to access this page...");
    }
  }


  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
