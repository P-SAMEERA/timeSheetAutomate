import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";

export default async function readAllUser(req, res) {
  try {
    const id = req.params.id;

    // ✅ Find any user (admin included)
    const user = await User.findById(id);

    // ✅ Check if this user exists and is an admin
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .send(new apiResponse(403, "You are not Admin", null));
    }

    // ✅ Fetch all active non-admin users (hide passwords)
    const users = await User.find(
      {role: { $ne: "admin" } },
      "-password"
    );

    if (!users)
      return res
        .status(404)
        .send(new apiResponse(404, "Data fetch failed", null));

    return res
      .status(200)
      .send(new apiResponse(200, "Data fetched successfully", users));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
