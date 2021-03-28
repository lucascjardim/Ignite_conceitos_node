const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  let checkUser = users.find(user => user.username === username);

  if (!checkUser) {
    return response.status(404).json({ error: "User not exists!" });
  }

  request.user = checkUser;
  return next();



}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const checkUserAlreadyExists = users.filter(user => user.username === username)
  if (checkUserAlreadyExists.length > 0) {
    return response.status(400).json({ error: "Username already exists" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const checkExistsTodo = user.todos.filter(todo => todo.id === id)
  if (checkExistsTodo.length === 0) {
    return response.status(404).json({ error: "id todo not found" });
  }

  user.todos.map((todo) => {
    if (todo.id == id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
    }
  });

  const todoUpdated = user.todos.filter(item => item.id === id);
  return response.status(200).json(todoUpdated[0]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const checkExistsTodo = user.todos.filter(todo => todo.id === id)
  if (checkExistsTodo.length === 0) {
    return response.status(404).json({ error: "id todo not found" });
  }

  user.todos.map(item => {
    if (item.id === id) {
      item.done = true;
    }
  });

  const todoDone = user.todos.filter(item => item.id === id);

  return response.status(200).json(todoDone[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const checkExistsTodo = user.todos.filter(todo => todo.id === id)
  if (checkExistsTodo.length === 0) {
    return response.status(404).json({ error: "id todo not found" });
  }
  const index = users.indexOf(user);
  users[index].todos.splice(checkExistsTodo, 1);
  console.log(users)

  return response.status(204).json();
});

module.exports = app;