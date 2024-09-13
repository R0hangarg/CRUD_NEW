import mongoose, { Schema } from "mongoose";
import { ProductType } from "../Interfaces/productInterface";

const productSchema :Schema = new Schema({
    name:{
      type: String,
      required: true,
      unique: true,
      min: 6
    },
    description:{
        type:String,
        required: true,
    },
    price:{
        type:Number,
        required: true,
    },
    category:{
        type:String,
        required: true,
    },
    stock:{
        type:Number,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    }
    
},{ timestamps: true })

const Product = mongoose.model<ProductType>('Product', productSchema);

export default Product;
