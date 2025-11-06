import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";
export default  async function createUser (req,res) {
    try {

       const id = req.params.id;
       const {userId,password,role} = req.body;
       const exists = await User.findOne({userId:userId});
       console.log(id);
        const Aexists = await User.findOne({_id:id});
        console.log(Aexists);
        const isAdmin = Aexists.role == "admin"? true:false;
        if(!isAdmin) return res.status(403).send(new apiResponse(403,"Only Admin has access for User",null));
       if(exists){
        return res.status(409).send(409,"UserId already exists",null);
       }

       const created = await User.create({
        userId:userId,
        password:password,
        role:role
       });
       const payLoad = {
        id:created._id,
        userId:created.userId,
        isActive:created.isActive
       }
       if(created){
        return res.status(201).send(new apiResponse(201,"User Created Successfully",payLoad));
       }
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(new apiResponse(500,"Internal Server Error",null));
    }
}