// Imported the libraries
const bodyParser = require("body-parser");
const express = require("express");

const app = express();

app.use(bodyParser.json());

let todos = [];

// Below api is to get the todo of given id
app.get("/getToDo/:id", (req, res) => {
  let indexOfToDo = -1;
  let targetId = req.params.id;

  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id == targetId) {
      indexOfToDo = i;
    }
  }

  if (indexOfToDo != -1) {
    res.status(200).send(todos[indexOfToDo]);
  } else {
    // res.status(404).send("Invalid ID");

    res.status(404).json({
      error: "Invalid ToDo ID provided (Please cross check it again)",
    });
  }
});

// Below api is to get all todos
app.get("/getAllToDos", (req, res) => {
  if (todos.length == 0) {
    res.json({
      message: "Empty ToDos Database (No Todos have been added yet",
    });
  } else {
    res.json(todos);
  }
});

// Below api is to add new todo 
app.post("/addToDo", (req, res) => {
  let newTodoId = todos.length + 1;
  let newTitle = req.body.title;
  let newDescription = req.body.description;
  let newCompleted = req.body.completed;

  let newTodo = {
    id: newTodoId,
    title: newTitle,
    description: newDescription,
    completed: newCompleted,
  };

  todos.push(newTodo);

  res.send(newTodo);
});

// Below api is to update any present todo
app.put("/updateToDo/:id", (req, res) => {
  let todo = null;
  let targetId = req.params.id;

  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id == targetId) {
      todo = todos[i];
    }
  }

  if (todo != null) {
    todo.title = req.body.title || todo.title;
    todo.description = req.body.description || todo.description;
    todo.completed = req.body.completed;

    res.status(200).json(todo);
  } else {
    res.status(404).json({
      error: "Invalid ToDo ID provided (Please cross check it again)",
    });
  }
});

// Below api is to delete present todo
app.delete("/deleteToDo/:id", (req, res) => {
  let indexOfToDo = -1;
  let targetId = req.params.id;

  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id == targetId) {
      indexOfToDo = i;
    }
  }

  if (indexOfToDo == -1) {
    // res.status(404).send("Invalid ID");

    res.status(404).json({
      error: "Invalid ToDo ID provided (Please cross check it again)",
    });
  } else {
    let deletedTodo = todos.splice(indexOfToDo, 1);
    
    res.json(deletedTodo[0]);
  }
});

app.listen(3000, () => {
  console.log(`Started the ToDo server at http://localhost:3000`);
});
