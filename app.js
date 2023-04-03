import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

config({path: "config/config.env"});
export const app = express();

//Using Middlewares
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit:"50mb",extended:true}))
app.use(cookieParser())

//Imporing Routes
import post from "./routes/post.js";
import user from "./routes/user.js";

//Using Router
app.use("/api/v1",post)
app.use("/api/v1",user)


