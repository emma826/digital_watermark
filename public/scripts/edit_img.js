let scale = 1;
const scaleStep = 0.1;
const maxScale = 3;
const minScale = 1;

const image = document.getElementById("image");
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const compressButton = document.getElementById("compressButton");
const rotateButton = document.getElementById("rotateButton");
const downloadButton = document.getElementById("downloadButton");
const digital_signature = document.getElementById("digital_signature")
const slider_text = document.getElementById("slider_text")
const compress_value = document.getElementById("compress_value")
const add_watermark_button = document.getElementById("add_watermark_button")
const watermark_opacity = document.getElementById("watermark_opacity")
const opacityLabel = document.getElementById("opacityLabel")
const error = document.getElementById("error")
const load_image_for_watermark = document.getElementById("image_for_watermark")
const image_container = document.getElementById("image_container")
let image_watermark

let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;
let rotationAngle = 0;
let currentImage = new Image();

// Load the image onto the canvas once on window load
window.addEventListener("load", () => {
	currentImage.src = image.src;

	currentImage.onload = () => {
		if (currentImage.width === 0 || currentImage.height === 0) {
			console.error("Image has a width or height of 0.");
			return;
		}

		// Set canvas dimensions to match the image
		canvas.width = currentImage.width;
		canvas.height = currentImage.height;

		// Draw the image onto the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(currentImage, 0, 0, currentImage.width, currentImage.height);
		console.log("Image loaded and drawn on canvas.");
	};

	currentImage.onerror = () => {
		console.error("Failed to load the image.");
	};
});

load_image_for_watermark.addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();
			img.src = e.target.result;
			image_container.innerHTML = `<img src="${e.target.result}" class="image-fluid rounded w-100"/>`


			img.onload = () => {
				image_watermark = img;
			};
		};

		reader.readAsDataURL(file);
	}
	else {
		image_watermark = null;
		image_container.innerHTML = `<i class="material-icons" style="font-size: 60px;">
											upload
										</i>
										<h6>Upload Image</h6>`
	}
})

watermark_opacity.addEventListener("change", (e) => {
	opacityLabel.innerHTML = `${e.target.value}%`
})

add_watermark_button.addEventListener("click", async () => {
	const opacity = watermark_opacity.value / 100 || 0
	const text = document.getElementById("watermarkText").value
	const image = image_watermark;
	const main_img = document.getElementById("image")


	if (!text) {

		if (!image) {
			error.style.display = "block"
			error.innerHTML = "please, input a watermark"

			setTimeout(() => {
				error.style.display = "none"
			}, 3000);

			return
		}

		ctx.save();
		const watermarkWidth = canvas.width / 5; // Scale watermark width relative to canvas
		const watermarkHeight = (image_watermark.height / image_watermark.width) * watermarkWidth; // Maintain aspect ratio

		// Calculate position to center the watermark
		const xPosition = (canvas.width - watermarkWidth) / 2; // Center horizontally
		const yPosition = (canvas.height - watermarkHeight) / 2; // Center vertically

		// Draw the watermark on the canvas
		ctx.globalAlpha = 0.5; // Set opacity for the watermark
		ctx.drawImage(image_watermark, xPosition, yPosition, watermarkWidth, watermarkHeight);
		ctx.globalAlpha = 1;


		ctx.restore();

		// Update the image container to display the new watermarked image

		main_img.src = canvas.toDataURL("image/png");

	}
	else {
		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.font = "80px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const x = canvas.width / 2;
		const y = canvas.height / 2;
		ctx.fillText(text, x, y);

		ctx.restore();
		main_img.src = canvas.toDataURL()
	}
})

compress_value.addEventListener("change", (e) => {
	slider_text.innerHTML = `${compress_value.value}%`
})

digital_signature.addEventListener("click", async () => {
	var params = {
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ project_id }),
		method: "POST"
	}

	await fetch("/project/sign_image", params)
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				console.log("Image signed successfully");
			} else {
				console.error("Signature failed:", data.errors);
			}
		})
})

saveButton.addEventListener("click", () => {
	// Convert canvas content to a Blob
	canvas.toBlob((blob) => {
		if (!blob) {
			console.error("Failed to create blob from canvas.");
			return;
		}

		// Create a FormData object to send the Blob
		const formData = new FormData();
		formData.append("image", blob, "canvas_image.jpg");
		formData.append("project_id", project_id)

		// Use fetch to POST the FormData to the server
		fetch("/project/upload_modified_img", {
			method: "POST",
			body: formData
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					console.log("Image uploaded successfully");
				} else {
					console.error("Upload failed:", data.errors);
				}
			})
			.catch((error) => {
				console.error("Error uploading image:", error);
			});
	}, "image/jpeg", 1);
});

// Download button functionality
downloadButton.addEventListener("click", () => {
	canvas.toBlob((blob) => {
		if (blob) {
			const link = document.createElement("a");
			const objectURL = URL.createObjectURL(blob);
			link.href = objectURL;
			link.download = "compressed_image.jpg";
			link.click();
			URL.revokeObjectURL(objectURL);
		} else {
			console.error("Failed to create blob for download.");
		}
	}, "image/jpeg", 0.8);

});

// Rotate button functionality
rotateButton.addEventListener("click", () => {

	rotationAngle = (rotationAngle + 90) % 360;

	// Calculate new canvas dimensions
	let newWidth, newHeight;
	if (rotationAngle === 90 || rotationAngle === 270) {
		newWidth = currentImage.height;
		newHeight = currentImage.width;
	} else {
		newWidth = currentImage.width;
		newHeight = currentImage.height;
	}

	// Update main canvas
	canvas.width = newWidth;
	canvas.height = newHeight;

	// Create an offscreen canvas to handle rotation
	const offscreenCanvas = document.createElement("canvas");
	const offscreenCtx = offscreenCanvas.getContext("2d");
	offscreenCanvas.width = newWidth;
	offscreenCanvas.height = newHeight;

	// Perform rotation
	offscreenCtx.translate(newWidth / 2, newHeight / 2);
	offscreenCtx.rotate(rotationAngle * Math.PI / 180);
	offscreenCtx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);

	// Draw rotated image onto the main canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(offscreenCanvas, 0, 0);

	// Update currentImage to the rotated image
	currentImage = new Image();
	currentImage.src = canvas.toDataURL();

	currentImage.onload = () => {
		console.log("Image rotated successfully.");
	};

	image.src = canvas.toDataURL()

	// rotate_img()

});

// const rotate_img = () => {
// 	image.style.transform = `rotate(${rotationAngle}deg)`;
// }

// Compress button functionality
compressButton.addEventListener("click", () => {
	const width = parseInt(compress_value.value * 10, 10) || currentImage.width;
	const height = parseInt(compress_value.value * 10, 10) || currentImage.height;
	const quality = 0.8;

	// Ensure non-zero dimensions
	if (width === 0 || height === 0) {
		console.error("Invalid width or height for compression.");
		return;
	}

	// Resize canvas and draw the compressed image
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(currentImage, 0, 0, width, height);

	// Convert to JPEG and trigger download
	// canvas.toBlob((blob) => {
	// 	if (!blob) {
	// 		alert("Failed to compress the image.");
	// 		return;
	// 	}

	// 	const objectURL = URL.createObjectURL(blob);
	// 	console.log("Compressed image blob:", blob);
	// 	console.log("Estimated size:", blob.size);
	// }, "image/png", quality);

	image.src = canvas.toDataURL()
});

// const compress_img = () => {
// 	image.style.width = `${compress_value.value}%`
// }

// Zoom in/out functionality
zoomInButton.addEventListener("click", () => {
	if (scale < maxScale) {
		scale += scaleStep;
		image.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
	}
});

zoomOutButton.addEventListener("click", () => {
	if (scale > minScale) {
		scale -= scaleStep;
		offsetX = 0;
		offsetY = 0;
		image.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
	}
});

// Image dragging functionality
image.addEventListener("mousedown", (e) => {
	if (scale > 1) {
		isDragging = true;
		startX = e.clientX - offsetX;
		startY = e.clientY - offsetY;
		image.parentNode.style.cursor = "grabbing";
	}
});

image.addEventListener("mousemove", (e) => {
	if (isDragging) {
		offsetX = e.clientX - startX;
		offsetY = e.clientY - startY;
		image.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
	}
});

image.addEventListener("mouseup", () => {
	isDragging = false;
	image.parentNode.style.cursor = "grab";
});

image.addEventListener("mouseleave", () => {
	isDragging = false;
	image.parentNode.style.cursor = "grab";
});
