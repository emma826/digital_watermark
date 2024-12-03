const express = require("express")
const router = express.Router()
const path = require("path")
const fileUpload = require("express-fileupload")
const crypto = require("crypto")
const project = require("../model/project_schema")
const mongoose = require("mongoose")
const body_parser = require("body-parser")

const { get_user_details } = require("./middleware")
const { signImage } = require('./signImage');
const user = require("../model/user_schema")

mongoose.connect("mongodb://0.0.0.0:27017/ch_project")

router.use(get_user_details)
router.use(body_parser.json())

const find_project = async (project_id, user_id) => {
	try {
		const find_project = await project.findById({ _id: project_id, user_id })

		if (!find_project) {
			return "project not found"
		}
		else {
			return find_project
		}
	}
	catch (err) {
		return "error finding project, try again later"
	}
}

const create_signature = async (user_id) => {
	try {
		let { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: {
				type: 'spki',
				format: "der"
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'der'
			}
		})

		const public_key = publicKey.toString('base64')
		const private_key = privateKey.toString('base64')

		await user.updateOne({ _id: user_id }, {
			$set: { public_key, private_key }
		})

		return { public_key, private_key }

	} catch (error) {
		console.log(error)
		return { error: "server error" }
	}
}

router.get("/", async (req, res) => {
	const { id } = req.user

	if (!id) {
		return res.status(500).json({ errors: "Session lost, login to fix issue" })
	}
	else {
		try {

			const fetch_projects = await project.find({ user_id: id }).sort({ date: -1 })

			if (!fetch_projects[0]) {
				return res.status(400).json({ error: 'No project created yet' });
			}
			else {
				return res.status(200).json({ ok: fetch_projects });
			}

		} catch (error) {
			console.log(error)
		}
	}

})

router.post("/name_project", async (req, res) => {
	const { project_name, project_id } = req.body

	if (!project_name || !project_id) {
		return res.status(400).json({
			error: "Please fill a name for your project"
		})
	}
	else {
		try {

			await project.updateOne({ _id: project_id }, {
				$set: { project_name }
			})

			return res.status(200).json({ success: "Project Name created successfully, redirecting ...", id: project_id })

		} catch (error) {
			return res.status(500).json({
				error: "Server error, Please try again later"
			})
		}
	}
})

router.post("/verify_signature", fileUpload(), (req, res) => {
	const { public_key, signature } = req.body
	const imageBuffer = req.files.image.data;

	if (!public_key || !signature) {
		return res.status(400).json({ errors: "Empty fields, please fill in the blank spaces" })
	}

	try {

		const publicKey = crypto.createPublicKey({
			key: Buffer.from(public_key, "base64"),
			type: "spki",
			format: "der",
		});

		const new_signature = Buffer.from(signature, "base64");

		const verify = crypto.createVerify("SHA256");
		verify.update(imageBuffer);
		verify.end();

		const isValid = verify.verify(publicKey, new_signature);
		if (isValid) {
			return res.status(200).json({ success: "Verification successful, Image is authentic" })
		} else {
			return res.status(400).json({ errors: "Image is not authentic" })
		}

	} catch (error) {
		console.log(error)
		return res.status(500).json({ errors: "Server error, please try again later" })
	}
})

router.post("/upload_img", fileUpload(), async (req, res) => {
	const { id } = req.user
	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).json({ error: 'No files were uploaded.' });
	}

	const uploadedFile = req.files.uploadedFile;
	const allowedTypes = ['image/jpeg', 'image/png'];

	if (!id) {
		return res.status(500).json({ errors: "Session lost, login to fix issue" })
	}

	if (!allowedTypes.includes(uploadedFile.mimetype)) {
		return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
	}

	if (uploadedFile.size > 1000000) {
		return res.status(400).json({ error: 'File too large, uploaded a file lower than 1MB' });
	}

	const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(uploadedFile.name);
	const date = new Date().getTime()


	try {
		const upload_file = await uploadedFile.mv(path.join(__dirname, '../public/uploads/original_file', uniqueName));
		const create_project = await project.create({ user_id: id, file_name: uniqueName, date })

		res.status(200).json({
			ok: create_project.id
		})

	} catch (error) {
		return res.status(400).json({ error: `Couldn't create project, try again later` });
	}
})

router.post("/upload_modified_img", fileUpload(), async (req, res) => {
	const { id } = req.user
	const { project_id } = req.body

	if (!id || !project_id) {
		return res.status(500).json({ errors: "Session lost, Please login to fix issue" })
	}

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).json({ error: 'No files were uploaded.' });
	}

	const image = req.files.image;
	const new_file_name = `${crypto.randomBytes(16).toString('hex')}_${image.name}`
	const uploadPath = path.join(__dirname, "../public/uploads/modified_file", new_file_name);

	try {
		await image.mv(uploadPath)
		await project.updateOne({ _id: project_id }, {
			$set: { modified_filename: new_file_name }
		})

		return res.status(200).json({ success: "Image saved successfully" })

	} catch (error) {
		return res.status(500).json({ errors: "Server error, please try again later" })
	}

})

router.post("/sign_image", async (req, res) => {
	const { project_id } = req.body
	let { id, public_key, private_key } = req.user

	if (!id || !project_id) {
		return res.status(500).json({ errors: "Session lost, login to fix issue" })
	}

	const get_project = await find_project(project_id, id)
	let modified_filename;

	if (get_project.id) {
		if (get_project.modified_filename) {
			modified_filename = path.join(__dirname, "../public/uploads/modified_file", get_project.modified_filename)
		}
		else {
			modified_filename = path.join(__dirname, "../public/uploads/original_file", get_project.file_name)
		}

		if (!public_key || !private_key) {
			const userSignature = await create_signature(id)

			if (!userSignature.error) {
				public_key = userSignature.public_key
				private_key = userSignature.private_key
			}
		}

		const sign_img = await signImage(modified_filename, private_key, id).then(signature => {

			if (signature.message = "success") {
				return res.status(200).json({
					public_key, signature: signature.signature.toString("base64")
				})
			}
			else {
				return res.status(400).json({ error: signature.error })
			}
		})
			.catch(err => {
				console.error('Error signing image:', err);
			});

	}
	else {
		return res.status(400).json({ errors: get_project })
	}
})


router.get("/create_project/:project_id", async (req, res) => {
	const project_id = req.params.project_id
	const url = path.join("project", "index")
	const { id } = req.user

	if (!id) {
		return res.redirect("/login")
	}

	const project_details = await find_project(project_id, id)

	if (!project_details.id) {
		res.redirect("/")
	}
	else {
		res.render(url, { project_details })
	}

})

router.get("/edit_project/:project_id", async (req, res) => {
	const { id } = req.user
	const project_id = req.params.project_id
	const url = path.join("project", "edit_project")

	if (!id) {
		return res.redirect("/")
	}

	const project_details = await find_project(project_id, id)

	if (!project_details.id) {
		res.redirect("/")
	}
	else {
		res.render(url, { project_details, project_id })
	}
})

router.get("/verify_image", (req, res) => {
	const { id } = req.user
	const url = path.join("project", "verify_image")

	if (!id) {
		return res.redirect("/")
	}

	res.render(url, { id })

})

router.get("/:project_id", async (req, res) => {
	const project_id = req.params.project_id

	try {

		const find_project = await project.findById({ _id: project_id })

		if (!find_project) {

		}
		else if (find_project.project_name) {
			res.redirect(`/project/edit_project/${project_id}`)
		}
		else {
			res.redirect(`/project/create_project/${project_id}`)
		}

	}
	catch (err) {
		res.redirect("/")
	}
})

module.exports = router