import bcrypt from "bcryptjs";
import { User } from "../db/connectDB.js";
import createtoken from "../utils/helpers/token.js";
import {v2 as cloudinary} from 'cloudinary';
export const signupUser= async (req,res)=>{
    try {
        const {
            name,username,password,
          
            
        } = req.body;
        const existingUser = await User.findOne({
            username: username
        })
        if (existingUser) {
            res.status(400).json({message: 'user already exists'})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({name,username,password:hashedPassword});
        const savedUser= await user.save();
        if(savedUser){
            createtoken(savedUser._id,res);
            res.status(201).json({
                message: 'user saved successfully',
               
                _id: savedUser._id,
                name: savedUser.name,
                username: savedUser.username,
                bio: savedUser.bio,
                profilePic: savedUser.profilePic,
              
             
            });
        }
        else{
            res.status(400).json({message: 'user not saved'})
        }
       
    } catch (error) {
                   console.log(error.message);
    }
   
};

export const signinUser= async (req,res)=>{
    try{
        const {username,password}= req.body;
        const user = await User.findOne({username});
        const ispass= await bcrypt.compare(password,user?.password || "");
        if(!user ){
            return res.status(401).json({message: 'invailed crendentials'});
        }
        createtoken(user._id,res);
        res.status(200).json({
            message: 'logged in successfully',
           
            _id: user._id,
            name: user.name,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        })

      



    }
    catch(error){
        res.status(400).json({message: error.message})
    }
}
export const logoutUser = (req, res) => {
    res.cookie('token','',{maxAge:1});
    res.status(200).json({
        success: true,
        message: "logged out"
    })
}
export const followunfollowUser = async (req, res) => {
    try{

        const Id= req.params.id;
        const friend= await User.findById(Id);
        const userId= req.user._id;
        const user= await User.findById(userId);
        if(Id===userId){
          return res.status(400).json({message: 'you cannot follow yourself'});
        }
        if(!friend){
          return res.status(400).json({message: 'user not found'});
        }
        const isfollow= user.followers.includes(Id);
      
        if(isfollow){
        await User.findByIdAndUpdate(Id,{$pull:{followers:userId}});
        await User.findByIdAndUpdate(userId,{$pull:{following:Id}})
        res.status(200).json({message: 'User unfollowed'});
      
        }
        else{
     
          await User.findByIdAndUpdate(Id,{$push:{followers:userId}});
          await User.findByIdAndUpdate(userId,{$push:{following:Id}})
          res.status(200).json({message: 'User followed'});
      
        }
      
    }
    catch(error){
        res.status(400).json({message: error.message})
    }


}
export const updataUser = async (req,res)=>{
    try{
        const {username,password,bio}= req.body;
        let{profilePic}= req.body;
        const user = await User.findById(req.user._id);
      
        user.username=username||user.username;
       
        user.bio=bio||user.bio;
        if(req.params.id!==req.user._id.toString()){
            res.status(404).json({message:"you cannot update other users profiles"})
        }
        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password= hashedPassword ||user.password;
        }
        if(profilePic){
            if(user.profilePic){
                cloudinary.uploader.destroy(user.profilePic.split('/').pop().split('.')[0]);
            }

           const result= await cloudinary.uploader.upload(profilePic);
           profilePic =result.secure_url;
        }
        user.profilePic=profilePic||user.profilePic;
        const savedUser= await user.save();
     
       res.status(200).json({message:"saved",
       _id: savedUser._id,
       name: savedUser.name,
       username: savedUser.username,
       bio: savedUser.bio,
       profilePic: savedUser.profilePic,
       followers: savedUser.followers,
       following: savedUser.following,
       createdAt: savedUser.createdAt,
       updatedAt: savedUser.updatedAt
    
    
    
    });
       
    } catch (error) {
                   console.log("error",error.message);
    }
}
export const getUserprofile= async (req, res) => {
    const username=req.params.username;
    try{
        const user = await User.findOne({username}).select('-password').select('-updateAt');
        res.status(200).json({user});
    }
    catch(error){
        res.status(400).json({message: error.message})
    }
}
