import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";

export default async function deleteUser(req,res){
    try {
        const id = req.params.id;
        const uId = req.body.id;
        // console.log(uId);
        const exists = await User.findOne({_id:id});

        const isAdmin = exists.role = "admin"? true:false;

        if (isAdmin) {
            const user = await User.findByIdAndUpdate(uId,{isActive:false},{ new: true, runValidators: true });
            return res.status(200).send(new apiResponse(200,"User deleted Successfully",user));
        }        
    } catch (error) {
        console.log(error);
        return res.status(500).send(new apiResponse(500,"Internal Server Error",null));
    }
}