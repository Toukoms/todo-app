/**
 * Speed query selector
 * @param {string} q
 */
const $ = (q) => {
  const e = document.querySelectorAll(q);
  if (e.length > 1) {
    return e;
  } else if (e.length === 1) {
    return e[0];
  }
  return null;
};

const LOCAL_TODO_KEY = "todo";
const addBtnElement = $("#add-btn");
const todoInputElement = $("#todo-input");
/**@type {HTMLFormElement} */
const todoFormElement = $("#todo-form");

class Todo {
  /**@type {Array} */
  static todoList = JSON.parse(localStorage.getItem(LOCAL_TODO_KEY)) || [];
  _generatedIDs = new Set(JSON.parse(localStorage.getItem("ids")) || []);

  _generateUniqueID() {
    const possibleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let identifier;

    do {
      identifier = "";
      for (let i = 0; i < 4; i++) {
        identifier += possibleChars.charAt(
          Math.floor(Math.random() * possibleChars.length)
        );
      }
    } while (this._generatedIDs.has(identifier)); // Check for duplicates

    this._generatedIDs.add(identifier); // Store the unique ID
    localStorage.setItem("ids", JSON.stringify(Array.from(this._generatedIDs)));
    return identifier;
  }

  /**
   * @param {string} id
   * @param {string} task
   * @param {boolean} done
   */
  constructor(task, id = "", done = false) {
    this.task = task;
    this.done = done;
    this.id = id ? id : this._generateUniqueID();
  }

  render() {
    return `
        <input type="checkbox" name="${this.id}" id="checkbox_${this.id}">
        <label for="checkbox_${this.id}" class="${
      this.done ? "checked" : ""
    }">${this.task}</label>
        <button id="btn_${this.id}">❌</button>
    `;
  }

  save() {
    let found = false;
    Todo.todoList.forEach((t) => {
      if (t.id === this.id) {
        t.done = this.done;
        t.task = this.task;
        found = true;
      }
    });
    if (!found) {
      Todo.todoList.unshift({
        id: this.id,
        task: this.task,
        done: this.done,
      });
    }
    localStorage.setItem(LOCAL_TODO_KEY, JSON.stringify(Todo.todoList));
  }

  deleteTodo() {
    if (!confirm("Are you sure you want to delete")) return;
    Todo.todoList = Todo.todoList.filter((t) => t.id !== this.id);
    this._generatedIDs.delete(this.id);
    localStorage.setItem(LOCAL_TODO_KEY, JSON.stringify(Todo.todoList));
    localStorage.setItem("ids", JSON.stringify(Array.from(this._generatedIDs)));
  }

  toggleDone() {
    this.done = !this.done;
    this.save();
  }

  static displayTODOs() {
    const todoListElement = $("#todo-list");
    todoListElement.innerHTML = "";
    const todoList = JSON.parse(localStorage.getItem(LOCAL_TODO_KEY)) || [];
    todoList.forEach((t) => {
      const todo = new Todo(t.task, t.id, t.done);
      const todoElement = document.createElement("div");
      todoElement.id = todo.id;
      todoElement.className = "todo";
      todoElement.innerHTML = todo.render();
      todoElement.querySelector("button").addEventListener("click", () => {
        todo.deleteTodo();
        Todo.displayTODOs();
      });
      todoElement.querySelector("input").checked = todo.done;
      todoElement.querySelector("input").addEventListener("change", () => {
        todo.toggleDone();
        Todo.displayTODOs();
      });
      todoListElement.appendChild(todoElement);
    });
  }
}

// ------------- Events Listener -----------------

window.addEventListener("load", () => {
  Todo.displayTODOs();
});

todoFormElement.addEventListener("submit", (e) => {
  e.preventDefault();
  if (todoInputElement.value === "") {
    alert("Please enter a text to add new todo");
    return;
  }
  const todo = new Todo(todoInputElement.value);
  todo.save();
  todoFormElement.reset();
  Todo.displayTODOs();
});
