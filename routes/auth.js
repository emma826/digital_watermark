const express = require("express")
const router = express.Router()
const body_parser = require("body-parser")
const bcrypt = require("bcryptjs")
const cookie_parser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const env = require("dotenv").config()
const user = require("../model/user_schema")

router.use(body_parser.json())
router.use(cookie_parser())

router.post("/register", async (req, res) => {
	const { name, email, password } = req.body

	if (!name || !email || !password) {
		return res.status(422).json({
			errors: "Please fill in the empty fields"
		})
	}
	else if (password.length < 8) {
		return res.status(422).json({
			errors: "Passwords must be u to 8 characters"
		})
	}
	else {

		
		try {
			const password_hash = await bcrypt.hash(password, 10)

			const create_user = await user.create({ name, email, password: password_hash })

			console.log(create_user)
			const token = jwt.sign(create_user.id, process.env.SECRET_KEY)
			
			res.cookie("ch_project", token, {
				maxAge: 3600 * 24 * 1000,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				path: "/",
				sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
			});



			return res.status(200).json({
				success: "Signup successful, redirecting ..."
			})

		} catch (error) {
			console.log(error)
			if (error.code == 11000) {
				return res.status(422).json({
					errors: "Email already exists in the database, try logging in"
				})
			}
			else {
				console.log(error)
				return res.status(500).json({
					errors: "Server error, please try again later"
				})
			}
		}
	}

})

router.post("/login", async (req, res) => {
	const { email, password } = req.body

	if (!email) {
		return res.status(422).json({
			errors: "Empty fields, please input your email address"
		})
	}
	else {
		try {

			const findUser = await user.findOne({ email })

			if (findUser.id) {

				const compare_password = await bcrypt.compare(password, findUser.password)

				if (compare_password == true) {
					const token = jwt.sign(findUser.id, process.env.SECRET_KEY)
					
					res.cookie("ch_project", token, {
						maxAge: 3600 * 24 * 1000,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						path: "/",
						sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
					});




					return res.status(200).json({
						success: "/main"
					})
				}
				else {
					return res.status(400).json({
						errors: "Invalid Email/Password"
					})
				}

			}
			else {
				return res.status(422).json({
					errors: "Account doesn't exist, signup to create account"
				})
			}

		} catch (error) {
			console.log(error)
			return res.status(500).json({
				errors: "Server error, don't worry we are working to fix the issue"
			})
		}
	}
})

router.get("/logout", async (req, res) => {
	res.clearCookie('ch_project');
	res.redirect("/login")
})


module.exports = router