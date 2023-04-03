import {app} from "./app.js"
import { connectDatabase } from "./config/database.js"
import cloudinary from "cloudinary"

connectDatabase();

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.SECRET_KEY,
});

app.listen(process.env.PORT,()=>{
    console.log(`server is runinng on ${process.env.PORT}`)
})