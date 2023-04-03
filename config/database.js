import mongoose from "mongoose";

export const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((con) => console.log(`Database Connected : ${con.connection.host}`))
    .catch((error) =>
      console.log("error occured while connecting to database" + error)
    );
};
