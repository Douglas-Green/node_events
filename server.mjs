/** @format */

import http from "http";
import fs from "fs";
import path from "path";
import {EventEmitter} from "events";

const NewsLetter = new EventEmitter();

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", chunk => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (req.url === "/newsletter_signup" && req.method === "POST") {
      const data = Buffer.concat(chunks).toString();
      const {name, email} = JSON.parse(data);
      NewsLetter.emit("signup", `${name}, ${email}\n`);
      res.writeHead(201, {"Content-Type": "application/json"});
      res.end(
        JSON.stringify({
          message: "Thank you for signing up for our newsletter!",
        })
      );
    } else if (req.url === "/newsletter_signup" && req.method === "GET") {
      const html = `
        <html>
          <body>
            <form action="/newsletter_signup" method="post">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name"><br><br>
              <label for="email">Email:</label>
              <input type="email" id="email" name="email"><br><br>
              <input type="submit" value="Sign up">
            </form>
          </body>
        </html>
      `;
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(html);
    } else {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.end("Not Found");
    }
  });
});

NewsLetter.on("signup", contact => {
  fs.appendFile("newsletter.csv", contact, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("Contact added to newsletter.csv");
    }
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
