const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModal");
const asynchandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMOngodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const comparePasswords = require("../utils/compareUserPassword");
const sendEmail = require("./emailController");

//Create a user in db using userModal
const createUser = asynchandler(async (req, res) => {
  const email = req.body.emial;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await User.create(req.body);
    const saveUser = await User.findById(newUser._id);

    res.json(saveUser);
  } else {
    //User already Exits
    throw new Error("User Already Exists");
  }
});

//Login User
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    //check if user exist or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatch(password))) {
      const refreshToken = await generateRefreshToken(findUser._id);
      const updateUser = await User.findOneAndUpdate(
        findUser?._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );

      const responseObject = {
        _id: findUser._id,
        firstname: findUser.firstname,
        lastname: findUser.lastname,
        email: findUser.email,
        mobile: findUser.mobile,
        token: generateToken(findUser._id),
        role: findUser?.role,
        cart: findUser?.cart,
        address: findUser?.address,
        wishList: findUser?.wishList,
      };
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 100,
      });
      res.json(responseObject);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//Handle Refresh Token
const handleRefreshTOken = asynchandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie) {
    throw new Error("No Refresh TOken in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("No Refresh token present in db or not match");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user._id);
    res.json({ accessToken });
  });
});

//Logout API
const logOut = asynchandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204); //forbidden
});

//Get all user
const getAllUser = asynchandler(async (req, res) => {
  try {
    const getUser = await User.find();
    const responseArray = getUser?.map((d) => {
      return {
        id: d._id,
        name: d.firstname + " " + d.lastname,
        email: d.email,
        mobile: d.mobile,
        role: d.role,
        cart: d.cart,
        isBlocked: d.isBlocked,
        address: d.address,
        wishlist: d.wishList,
      };
    });
    res.json(responseArray);
  } catch (error) {
    throw new Error(error);
  }
});

//Get a single user

const getUser = asynchandler(async (req, res) => {
  const { id } = req?.params;
  validateMongoDBID(id);
  try {
    const getaUser = await User.findById(id);
    const responseObj = {
      id: getaUser._id,
      name: getaUser.firstname + " " + getaUser.lastname,
      email: getaUser.email,
      mobile: getaUser.mobile,
      role: getaUser.role,
      cart: getaUser.cart,
      isBlocked: getaUser.isBlocked,
      address: getaUser.address,
      wishlist: getaUser.wishList,
    };
    res.json(responseObj);
  } catch (error) {
    throw new Error(error);
  }
});

//Delete User
const deleteUser = asynchandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);

  try {
    const deleteAUser = await User.findByIdAndDelete(id);
    const responseObj = {
      id: deleteAUser._id,
      name: deleteAUser.firstname + " " + deleteAUser.lastname,
      email: deleteAUser.email,
      mobile: deleteAUser.mobile,
      role: deleteAUser.role,
    };
    res.json(responseObj);
  } catch (error) {
    throw new Error(error);
  }
});

//UpdateAUser
const updateUser = asynchandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDBID(id);
  const { firstname, lastname, email, mobile, role } = req.body;
  const updatedValue = {
    firstname: firstname || "",
    lastname: lastname || "",
    email: email || "",
    mobile: mobile || "",
    role: role || "",
  };

  const updatedUser = await User.findByIdAndUpdate(id, updatedValue, {
    new: true,
  });
  res.json(updatedUser);
});

const blockedUser = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  validateMongoDBID(id);

  // Check if isBlocked is present in the request body
  if (isBlocked === undefined || isBlocked === null) {
    return res
      .status(400)
      .json({ error: "isBlocked is required in the request body" });
  }

  try {
    await User.findByIdAndUpdate(id, { isBlocked }, { new: true }).exec();

    if (!isBlocked) {
      res.json({ message: "User Unblocked" });
    } else {
      res.json({ message: "User Blocked" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update Password
const updatePassword = asynchandler(async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;

  validateMongoDBID(id);
  if (!oldPassword || !newPassword) {
    throw new Error("Both oldPassword and newPassword are required");
  }

  const user = await User.findById(id);

  // Assuming comparePasswords is a function that compares the old password with the stored password
  const isPasswordValid = await comparePasswords(oldPassword, user.password);

  if (isPasswordValid) {
    user.password = newPassword;
    await user.save(); // Fix: Use await user.save() instead of await User.save()
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.json({ message: "Password updated successfully" });
  } else {
    throw new Error("Invalid old password");
  }
});

//Forgot Password
const forgotPasswordToken = asynchandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({email});
  
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToekn();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset your password. This link is valid until 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;

    const data = {
      to: email,
      text: "Hi,user",
      subject: "Forgot Password",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockedUser,
  handleRefreshTOken,
  logOut,
  updatePassword,
  forgotPasswordToken,
};
