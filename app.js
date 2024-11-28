const express = require("express")
const app = express()
const port = process.env.PORT || 5003
const path = require("path")
const mongoose = require("mongoose")
const cookie_parser = require("cookie-parser")
const env = require("dotenv").config()

const project = require("./routes/project")
const auth = require("./routes/auth")
const { get_user_details } = require("./routes/middleware")

mongoose.connect("mongodb://0.0.0.0:27017/ch_project")

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))
app.use(cookie_parser())
app.use("/project", project)
app.use("/auth", auth)

app.get("/", get_user_details, async (req, res) => {
    const { id, name, email } = req.user

    if (!id) {
        res.render("login", { id, name, email })
    }
    else {
        res.render("index")
    }
})

app.get("/:url", async (req, res) => {
    const url = req.params.url
    res.render(url)
})

app.listen(port, () => console.log(`server listening on port ${port}`))