import apiResponse from "../../middlewares/apiResponse.js";
import Timesheet from "../../models/timesheet.model.js";

export default async function read(req,res)
{
    try {
        const id = req.params.id;
        if(!id) return res.status(400).send(new apiResponse(400,"ID is missing in params",null));
        const sheets = await Timesheet.find({userId:id});
        if(!sheets) return res.status(404).send(new apiResponse(404,"No timesheets for this ID",null));
        // console.log(sheets);
        return res.status(200).send(new apiResponse(200,"Successfully fetched the time sheets",sheets));
    } catch (error) {
        console.log(error);
        return res.status(500).send(new apiResponse(500,"Internal Server Error",null));
    }
}