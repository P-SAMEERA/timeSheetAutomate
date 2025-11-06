import apiResponse from "../../middlewares/apiResponse.js";
import User from "../../models/users.model.js";

export default async function readOneUserForProfile(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .send(new apiResponse(400, "User ID is required", null));
    }

    const user = await User.findOne({ _id:userId});
    if (!user) {
      return res
        .status(404)
        .send(new apiResponse(404, "User Not Found", null));
    }

    // Return user data (keeping password only for test mode)
    return res
      .status(200)
      .send(
        new apiResponse(200, "User Data fetched successfully", {
          userId: user.userId,
          password: user.password,
        })
      );
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
