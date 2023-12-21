const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const bcrypt = require("bcrypt");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// below file to rename the file
const fs = require('fs');
const cookieParser = require("cookie-parser");
const secret = "hellomynameisaditya";
const User = require("./models/User");
const Post = require("./models/Post");
const uploadMiddleware = multer({dest:'uploads/'})
const app = express(); 
// app.use(cors());     /// when we are using jet then we have to use in below way
app.use(cors({credentials:true,origin:"http://localhost:3000"}))  /// this the origin addreess is of main page.

app.use(express.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookieParser());

const salt = bcrypt.genSaltSync(10);

mongoose.connect(
  "mongodb+srv://blog:7R8bgff3IAQ0WmSV@cluster0.y8dq66n.mongodb.net/?retryWrites=true&w=majority"
);

app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(200).json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

// app.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const userDoc = await User.findOne({ username });
//     // res.json(userDoc);
//     const passok = bcrypt.compareSync(password, userDoc.password);
//     // res.json(passok);
//     if(passok){
//       jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
//         if(err) throw err;
//         // res.json(token);
//         res.cookie('token',token).json({
//           id:userDoc._id,  
//           username,
//         });
//       });
//     }
//     else{
//       res.status(200).json("Wrong credentials!");
//     }
//   } catch (e) {
//     console.log(e);
//   }
// });

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    // res.json(userDoc);
    const passok = bcrypt.compareSync(password, userDoc.password);
    // res.json(passok);
    if(passok){
      jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
        if(err) throw err;
        // res.json(token);
        res.cookie('token',token).json({
          id:userDoc._id,
          username,
        });
      });
    }
    else{
      res.status(200).json("Wrong credentials!");
    }
  } catch (e) {
    console.log(e);
  }
});

app.get('/profile',(req,res)=>{
  // res.cookie(req.cookies);
  const {token} = req.cookies;
  jwt.verify(token,secret,{},(err,info)=>{
    if(err) throw err;
    res.json(info);
  });
});


app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok');
});

app.post('/post',uploadMiddleware.single('file'), async(req,res)=>{
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length-1];
  const newPath = path+'.'+ext;
  fs.renameSync(path,newPath);

  const {title,summary,content} = req.body;
  const postDoc = await Post.create({
    title,
    summary,
    content,
    cover:newPath,
  });

  res.json(postDoc);

  // res.json({files:req.file});
});


// pasword: 7R8bgff3IAQ0WmSV
//username : blog


app.listen(4000, (req, res) => {
  console.log("app runs on 4000!");
});
