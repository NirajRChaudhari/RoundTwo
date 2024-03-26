const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = http.createServer(app);

const io = socketIo(server);

const db = new sqlite3.Database(
  "./database.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.log("Error Opening Database ", err.message);
      return;
    }

    console.log("Connected to the SQLite database");
  }
);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS documents (name TEXT PRIMARY KEY, content TEXT)",
    [],
    (err) => {
      if (err) {
        console.log("Error Creating Table ", err.message);
      }
      console.log("Table 'documents' created successfully");

      const PORT = 3000;
      server.listen(PORT, () => {
        console.log(
          `Real Time Collaboration server is running on port ${PORT}`
        );
      });
    }
  );
});

function saveDocument(name, content) {
  db.run(
    `INSERT INTO documents(name, content) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET content = excluded.content`,
    [name, content],
    (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log(`Document ${name} saved/updated successfully.`);
    }
  );
}

function getDocuments(name, callback) {
  db.get("SELECT content FROM documents WHERE name = ?", [name], (err, row) => {
    if (err) {
      return console.log(err.message);
    }

    callback(row ? row.content : "");
  });
}

io.on("connection", (socket) => {
  console.log("A new user connected.");

  socket.on("join", (docName) => {
    console.log("Connected to document :" + docName);
    socket.join(docName);

    getDocuments(docName, (content) => {
      console.log(content);
      socket.emit("doc", content);
    });
  });

  socket.on("edit", ({ docName, text }) => {
    saveDocument(docName, text);

    // documentData[docName] = text;

    socket.to(docName).emit("doc", text);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

app.use(express.static("public"));

app.get("/:docName", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
