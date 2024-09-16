import mongoose from "mongoose"

const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_DB_URI}/${process.env.DATABASE_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch(err){
        console.error("MongoDB Connection Failed!\nError:\n",err);
        process.exit(1)
    }
}

export default connectDB