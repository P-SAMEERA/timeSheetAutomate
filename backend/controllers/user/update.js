import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";

export default async function updateUser(req,res){
    try {
         const id = req.params.id;
        //  console.log(req.body);
        const uid = req.body.id;
        const exists = await User.findOne({_id:id});
        const isAdmin = exists.role == "admin"? true:false;

        if(!isAdmin) return res.status(403).send(new apiResponse(403,"Only Admin has access for User edit",null));
        const updated = await User.findByIdAndUpdate(uid,{$set:{...req.body}},{ new: true, runValidators: true });

        if(!updated) return res.status(404).send(new apiResponse(404,"Error Occured, try again",null));

        return res.status(200).send(new apiResponse(200,"Updated successfully",updated));
    } catch (error) {
        console.log(error);
        return res.status(500).send(new apiResponse(500,"Internal Server Error",null));
        
    }
}