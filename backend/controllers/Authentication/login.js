import User from "../../models/users.model.js";
import apiResponse from "../../middlewares/apiResponse.js";

export default async function login(req, res) {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .send(new apiResponse(400, "Fill all the required fields", null));
    }

    const validUser = await User.findOne({ userId: userId, password: password });

    if (!validUser) {
      return res
        .status(400)
        .send(new apiResponse(400, "Invalid Credentials", null));
    }

    // ✅ New check — allow login only if user is active
    if (!validUser.isActive) {
      return res
        .status(403)
        .send(new apiResponse(403, "User account is deactivated", null));
    }

    const data = {
      userId: validUser._id,
      name: validUser.userId,
      password: validUser.password,
      role: validUser.role,
    };

    return res
      .status(200)
      .send(new apiResponse(200, "Login Successful", data));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
