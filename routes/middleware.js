const express = require("express")
const router = express.Router()
const cookie_parser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const env = require("dotenv").config()
const user = require("../model/user_schema")
const project = require("../model/project_schema")

router.use(cookie_parser())

async function get_user_details(req, res, next) {
	const { ch_project } = req.cookies

	try {

		const verify_id = await jwt.verify(ch_project, process.env.SECRET_KEY)
		const find_user = await user.findById({ _id: verify_id })

		if (!find_user) {
			req.user = {
				id: null
			}
			next()
		}
		else {
			req.user = {
				id: find_user.id,
				name: find_user.name,
				email: find_user.email,
				public_key: find_user.public_key,
				private_key : find_user.private_key
			}
			next()
		}

	} catch (error) {
		req.user = {
			id: null
		}
		next()
	}
}


module.exports = { get_user_details }