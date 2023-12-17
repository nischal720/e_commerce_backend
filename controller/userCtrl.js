const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModal");
const asynchandler = require("express-async-handler");
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
  //check if user exist or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatch(password))) {
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
    res.json(responseObject);
  } else {
    throw new Error("Invalid Credentials");
  }
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
  const { id } = req?.user;
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

module.exports = {
  createUser,
  loginUser,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockedUser,
};
