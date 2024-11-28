const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const user = require('../model/user_schema')

async function signImage(filePath, private_key, id) {
	try {
		const privateKey = crypto.createPrivateKey({
			key: Buffer.from(private_key, "base64"),
			type: "pkcs8",
			format: "der",
		});

		// Read the image file synchronously
		const fileBuffer = fs.readFileSync(filePath);

		// Create the signature
		const sign = crypto.createSign("SHA256");
		sign.update(fileBuffer);
		sign.end();
		const signature = sign.sign(privateKey);

		// Store the signature in the database
		const result = await user.updateOne({ _id: id }, { $set: { signature } });
		if (result.nModified === 0) {
			throw new Error("Failed to update user with the signature");
		}

		return { message: "success", signature };
	} catch (error) {
		console.error("Error signing the image:", error);
		return { message: "error", error }
	}
}

module.exports = { signImage };
