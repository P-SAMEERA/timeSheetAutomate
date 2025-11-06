import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";

export default async function readOneUser(req,res){
    try {
        
        const id = req.params.id;
        const userId = req.body;
        const admin = await User.findOneById({_id:id});
        const isAdmin = admin.role == "admin"? true : false;
        if(!isAdmin){
            return res.status(403).send(new apiResponse(403,"You are not Admin",null));
        } 
        const user = await User.findOneById({_id:userId,isActive:true},'-password');

        if(!user) return res.status(404).send(new apiResponse(404,'User Not Found',null))

        return res.status(200).send(new apiResponse(200,"User Data fetched Successfully",user));
    } catch (error) {
        console.log(error);
        return res.status(500).send(new apiResponse(500,"Internal Server Error",null))
    }
}