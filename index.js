import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";

const blogs = [];
const comments =[];
let name, category, email, blog, modified_category, topic;

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(morgan("combined"));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public")); // Serve static files from 'public' directory
app.use(bodyParser.urlencoded({ extended: true }));

function timeConstraints() {
    const today = new Date();
    const fullTime = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    return fullTime;
}

app.get("/", (req, res) => {
    res.render("index", { fullTime: timeConstraints(), blogs: [] });
});

app.get("/create-blogs", (req, res) => {
    res.render("create-blogs", { fullTime: timeConstraints() });
});

app.get("/technology", (req, res) => {
    const technologyBlogs = blogs.filter(blog => blog.category === "technology");
    res.render("technology", { fullTime: timeConstraints(), blogs: technologyBlogs });
});

app.get("/business", (req, res) => {
    const businessBlogs = blogs.filter(blog => blog.category === "business");
    res.render("business", { fullTime: timeConstraints(), blogs: businessBlogs });
});

app.get("/finance", (req, res) => {
    const financeBlogs = blogs.filter(blog => blog.category === "finance");
    res.render("finance", { fullTime: timeConstraints(), blogs: financeBlogs });
});

app.get("/gaming", (req, res) => {
    const gamingBlogs = blogs.filter(blog => blog.category === "gaming");
    res.render("gaming", { fullTime: timeConstraints(), blogs: gamingBlogs });
});

app.get("/personal-development", (req, res) => {
    const personalDevelopmentBlogs = blogs.filter(blog => blog.category === "personal-development");
    res.render("personal-development", { fullTime: timeConstraints(), blogs: personalDevelopmentBlogs });
});

app.get("/education", (req, res) => {
    const educationBlogs = blogs.filter(blog => blog.category === "education");
    res.render("education", { fullTime: timeConstraints(), blogs: educationBlogs });
});

app.post("/submit", (req, res) => {
    name = req.body["name"];
    category = req.body["category"];
    email = req.body["email"];
    blog = req.body["blog"];
    topic = req.body["topic"];
    modified_category = category;

    // Handle "Personal Development" category
    if (category === "Personal Development") {
        modified_category = category.toLowerCase() + "-development";
    } else {
        modified_category = category.toLowerCase();
    }

    // Replace newline characters with <br> tags in the blog content
    const formattedBlog = blog.replace(/\n/g, '<br>');

    // Add new blog post to the blogs array
    blogs.push({
        topic: topic, 
        name: name,
        email: email,
        blog: formattedBlog, // Use the formatted blog content
        category: modified_category // Add category to the blog object
    });

    // Reverse the blogs array for display
    const modified_blogs = [...blogs].reverse();
    
    // Render the correct view based on the modified category
    if (["business", "finance", "gaming", "personal-development", "technology", "education"].includes(modified_category)) {
        res.render(modified_category, {
            blogs: modified_blogs.filter(blog => blog.category === modified_category),
            topic: topic, // Ensure topic is passed to the template
            fullTime: timeConstraints()
        });
    } else {
        res.status(404).send('<h1>Page not found</h1>');
    }
});

app.post("/delete/:index", (req, res) => {
    const blogIndex = parseInt(req.params.index, 10);

    if (blogIndex >= 0 && blogIndex < blogs.length) {
        const deletedBlog = blogs.splice(blogIndex, 1)[0]; // Removes the blog from the array
        res.redirect(`/${deletedBlog.category}`);
    } else {
        console.log(`${blogIndex} out of range.`);
        res.status(404).send('<h1>Page not found</h1>');
    }
});

app.get("/edit/:index", (req, res) => {
    const blogIndex = parseInt(req.params.index, 10);

    if (blogIndex >= 0 && blogIndex < blogs.length) {
        const blog = blogs[blogIndex];
        res.render("edit", { blog, index: blogIndex });
    } else {
        res.status(404).send('<h1>Blog not found</h1>');
    }
});

app.post("/update/:index", (req, res) => {
    const blogIndex = parseInt(req.params.index, 10);

    if (blogIndex >= 0 && blogIndex < blogs.length) {
        const { topic, name, email, category, blog } = req.body;

        // Replace newline characters with <br> tags in the blog content
        const formattedBlog = blog.replace(/\n/g, '<br>');

        blogs[blogIndex] = {
            topic,
            name,
            email,
            category: category.toLowerCase(),
            blog: formattedBlog
        };

        res.redirect(`/${category.toLowerCase()}`);
    } else {
        res.status(404).send('<h1>Blog not found</h1>');
    }
});

app.post("/comment/:index", (req, res) => {
    const blogIndex = parseInt(req.params.index, 10);
    const comment = req.body.comment;

    if (blogIndex >= 0 && blogIndex < blogs.length) {
        // Initialize comments array if it doesn't exist
        if (!blogs[blogIndex].comments) {
            blogs[blogIndex].comments = [];
        }
        // Add the comment to the blog post's comments array
        blogs[blogIndex].comments.push(comment);

        // Redirect back to the blog's page
        res.redirect(`/${blogs[blogIndex].category}`);
    } else {
        res.status(404).send('<h1>Blog post not found</h1>');
    }
});

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
